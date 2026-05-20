import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

// GET /api/admin/payouts - List all pending and completed payouts
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const [payouts, total] = await Promise.all([
      db.payout.findMany({
        where: { status: status as any },
        include: {
          vendor: {
            select: { storeName: true, user: { select: { name: true, email: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.payout.count({ where: { status: status as any } }),
    ]);

    return NextResponse.json({
      payouts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Payouts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 });
  }
}

// PUT /api/admin/payouts - Process a payout
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payoutId, status, transactionId, notes } = await req.json();

    if (!payoutId || !["PROCESSING", "COMPLETED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const payout = await db.payout.update({
      where: { id: payoutId },
      data: {
        status,
        transactionId,
        notes,
        processedAt: status === "COMPLETED" ? new Date() : undefined,
      },
      include: {
        vendor: { select: { userId: true, storeName: true } },
      },
    });

    // Notify vendor
    await db.notification.create({
      data: {
        userId: payout.vendor.userId,
        type: "SYSTEM",
        title: `Payout ${status.toLowerCase()}`,
        message: `Your payout of ₹${payout.amount} has been ${status.toLowerCase()}.`,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "PROCESS_PAYOUT",
      entity: "Payout",
      entityId: payoutId,
      details: { status, transactionId },
    });

    return NextResponse.json({ payout });
  } catch (error) {
    console.error("Payout process error:", error);
    return NextResponse.json({ error: "Failed to process payout" }, { status: 500 });
  }
}
