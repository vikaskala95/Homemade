import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

// GET /api/orders/refund - Get user's refund requests
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const refunds = await db.refund.findMany({
      where: { userId: session.user.id },
      include: {
        order: { select: { orderNumber: true, total: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ refunds });
  } catch (error) {
    console.error("Fetch refunds error:", error);
    return NextResponse.json({ error: "Failed to fetch refunds" }, { status: 500 });
  }
}

// POST /api/orders/refund - Request a refund
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, reason } = await req.json();

    if (!orderId || !reason) {
      return NextResponse.json({ error: "Order ID and reason are required" }, { status: 400 });
    }

    const order = await db.order.findFirst({
      where: { id: orderId, userId: session.user.id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus !== "PAID") {
      return NextResponse.json({ error: "Only paid orders can be refunded" }, { status: 400 });
    }

    // Check for existing refund
    const existingRefund = await db.refund.findFirst({
      where: { orderId, status: { in: ["PENDING", "APPROVED"] } },
    });

    if (existingRefund) {
      return NextResponse.json({ error: "A refund request already exists for this order" }, { status: 400 });
    }

    const refund = await db.refund.create({
      data: {
        orderId,
        userId: session.user.id,
        amount: order.total,
        reason,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      entity: "Refund",
      entityId: refund.id,
      details: `Refund requested for order ${order.orderNumber}`,
    });

    // Create notification for admin
    const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    await db.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: "PAYMENT" as const,
        title: "Refund Request",
        message: `Refund requested for order ${order.orderNumber} - ₹${order.total}`,
        link: `/admin/orders`,
      })),
    });

    return NextResponse.json({ refund }, { status: 201 });
  } catch (error) {
    console.error("Refund request error:", error);
    return NextResponse.json({ error: "Failed to create refund" }, { status: 500 });
  }
}
