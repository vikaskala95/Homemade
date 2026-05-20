import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { productId, rating, title, comment } = parsed.data;

    // Check if user has ordered this product
    const hasOrdered = await db.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          paymentStatus: "PAID",
        },
      },
    });

    if (!hasOrdered) {
      return NextResponse.json(
        { error: "You can only review products you have purchased" },
        { status: 403 }
      );
    }

    const review = await db.review.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      create: {
        userId: session.user.id,
        productId,
        rating,
        title,
        comment,
        isVerified: true,
      },
      update: {
        rating,
        title,
        comment,
      },
    });

    // Update product rating
    const avgRating = await db.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    });

    await db.product.update({
      where: { id: productId },
      data: {
        rating: avgRating._avg.rating || 0,
        reviewCount: avgRating._count,
      },
    });

    return NextResponse.json({ message: "Review submitted", review });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
