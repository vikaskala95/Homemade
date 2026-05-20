import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { select: { id: true, productName: true, quantity: true, price: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({ orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, status } = await req.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: "Order ID and status required" }, { status: 400 });
    }

    const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ message: "Order updated", order });
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
