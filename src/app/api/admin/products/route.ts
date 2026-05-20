import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function isAdmin() {
  const session = await auth();
  if (!session?.user?.id) return false;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

export async function GET(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (status) where.status = status;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          vendor: { select: { storeName: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { productId, status, isFeatured } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const data: any = {};
    if (status) data.status = status;
    if (isFeatured !== undefined) data.isFeatured = isFeatured;

    const product = await db.product.update({
      where: { id: productId },
      data,
    });

    return NextResponse.json({ message: "Product updated", product });
  } catch (error) {
    console.error("Admin product update error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
