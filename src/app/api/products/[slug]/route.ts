import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth();

    const product = await db.product.findUnique({
      where: { slug: params.slug },
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            slug: true,
            logo: true,
            rating: true,
            totalSales: true,
          },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await db.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    // Track product view for recommendations
    db.productView.create({
      data: {
        productId: product.id,
        userId: session?.user?.id || null,
      },
    }).catch(() => {}); // Fire and forget

    // Get related products
    const relatedProducts = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: "ACTIVE",
      },
      include: {
        vendor: { select: { id: true, storeName: true, slug: true } },
      },
      take: 4,
    });

    return NextResponse.json({ product, relatedProducts });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
