import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

async function isAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true } });
  return user?.role === "ADMIN" ? user : null;
}

// GET /api/admin/refunds - List all refunds
export async function GET(req: Request) {
  try {
    const admin = await isAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (status) where.status = status;

    const [refunds, total] = await Promise.all([
      db.refund.findMany({
        where,
        include: {
          order: {
            select: { orderNumber: true, total: true, status: true, userId: true },
            include: { user: { select: { name: true, email: true } } } as any,
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.refund.count({ where }),
    ]);

    return NextResponse.json({
      refunds,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin refunds error:", error);
    return NextResponse.json({ error: "Failed to fetch refunds" }, { status: 500 });
  }
}

// PUT /api/admin/refunds - Approve/reject refund
export async function PUT(req: Request) {
  try {
    const admin = await isAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { refundId, status, adminNotes } = await req.json();

    if (!refundId || !["APPROVED", "REJECTED", "PROCESSED"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const refund = await db.refund.update({
      where: { id: refundId },
      data: {
        status,
        adminNotes,
        processedAt: status === "PROCESSED" ? new Date() : undefined,
      },
      include: { order: true },
    });

    // Update order status if refund is processed
    if (status === "PROCESSED") {
      await db.order.update({
        where: { id: refund.orderId },
        data: { status: "REFUNDED", paymentStatus: "REFUNDED" },
      });
    }

    await createAuditLog({
      userId: admin.id,
      action: status === "APPROVED" ? "APPROVE" : status === "REJECTED" ? "REJECT" : "REFUND",
      entity: "Refund",
      entityId: refundId,
      details: `Refund ${status.toLowerCase()} for order ${refund.order.orderNumber}`,
    });

    // Notify user
    await db.notification.create({
      data: {
        userId: refund.userId,
        type: "PAYMENT",
        title: `Refund ${status === "APPROVED" ? "Approved" : status === "REJECTED" ? "Rejected" : "Processed"}`,
        message: `Your refund for order ${refund.order.orderNumber} has been ${status.toLowerCase()}.`,
        link: "/orders",
      },
    });

    return NextResponse.json({ refund });
  } catch (error) {
    console.error("Admin refund action error:", error);
    return NextResponse.json({ error: "Failed to update refund" }, { status: 500 });
  }
}
