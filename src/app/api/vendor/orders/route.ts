import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await db.vendor.findUnique({ where: { userId: session.user.id } });
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    const orderFilter = status ? { order: { status: status as any } } : {};

    const [items, total] = await Promise.all([
      db.orderItem.findMany({
        where: { vendorId: vendor.id, ...orderFilter },
        include: {
          order: {
            select: { id: true, orderNumber: true, status: true, paymentStatus: true, createdAt: true },
          },
          product: { select: { id: true, name: true, slug: true, images: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.orderItem.count({ where: { vendorId: vendor.id, ...orderFilter } }),
    ]);

    return NextResponse.json({
      orders: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Vendor orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
