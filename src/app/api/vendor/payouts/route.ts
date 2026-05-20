import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/vendor/payouts - Get vendor's payout history
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await db.vendor.findFirst({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const payouts = await db.payout.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Calculate available balance (completed orders minus paid payouts)
    const totalEarnings = await db.orderItem.aggregate({
      where: {
        vendorId: vendor.id,
        order: { paymentStatus: "PAID" },
      },
      _sum: { total: true },
    });

    const totalPaidOut = await db.payout.aggregate({
      where: {
        vendorId: vendor.id,
        status: "COMPLETED",
      },
      _sum: { amount: true },
    });

    const pendingPayouts = await db.payout.aggregate({
      where: {
        vendorId: vendor.id,
        status: { in: ["PENDING", "PROCESSING"] },
      },
      _sum: { amount: true },
    });

    const commission = (totalEarnings._sum.total || 0) * (vendor.commission / 100);
    const availableBalance =
      (totalEarnings._sum.total || 0) -
      commission -
      (totalPaidOut._sum.amount || 0) -
      (pendingPayouts._sum.amount || 0);

    return NextResponse.json({
      payouts,
      balance: {
        totalEarnings: totalEarnings._sum.total || 0,
        commission,
        totalPaidOut: totalPaidOut._sum.amount || 0,
        pendingPayouts: pendingPayouts._sum.amount || 0,
        available: Math.max(0, availableBalance),
      },
    });
  } catch (error) {
    console.error("Vendor payouts error:", error);
    return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 });
  }
}

// POST /api/vendor/payouts - Request a payout
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await db.vendor.findFirst({
      where: { userId: session.user.id, status: "APPROVED" },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not approved" }, { status: 403 });
    }

    const { amount } = await req.json();

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Minimum payout amount is ₹100" },
        { status: 400 }
      );
    }

    // Verify balance
    const totalEarnings = await db.orderItem.aggregate({
      where: { vendorId: vendor.id, order: { paymentStatus: "PAID" } },
      _sum: { total: true },
    });

    const totalPaidOut = await db.payout.aggregate({
      where: { vendorId: vendor.id, status: "COMPLETED" },
      _sum: { amount: true },
    });

    const pendingPayouts = await db.payout.aggregate({
      where: { vendorId: vendor.id, status: { in: ["PENDING", "PROCESSING"] } },
      _sum: { amount: true },
    });

    const commission = (totalEarnings._sum.total || 0) * (vendor.commission / 100);
    const available =
      (totalEarnings._sum.total || 0) -
      commission -
      (totalPaidOut._sum.amount || 0) -
      (pendingPayouts._sum.amount || 0);

    if (amount > available) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    const payout = await db.payout.create({
      data: {
        vendorId: vendor.id,
        amount,
        status: "PENDING",
      },
    });

    // Notify admins
    const admins = await db.user.findMany({ where: { role: "ADMIN" } });
    await db.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: "SYSTEM" as const,
        title: "New payout request",
        message: `${vendor.storeName} requested a payout of ₹${amount}`,
        link: "/admin/payouts",
      })),
    });

    return NextResponse.json({ payout }, { status: 201 });
  } catch (error) {
    console.error("Payout request error:", error);
    return NextResponse.json({ error: "Failed to create payout request" }, { status: 500 });
  }
}
