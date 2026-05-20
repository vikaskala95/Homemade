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

// GET /api/admin/stats
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      pendingVendors,
      pendingProducts,
      recentOrders,
      revenue,
    ] = await Promise.all([
      db.user.count(),
      db.vendor.count({ where: { status: "APPROVED" } }),
      db.product.count({ where: { status: "ACTIVE" } }),
      db.order.count(),
      db.vendor.count({ where: { status: "PENDING" } }),
      db.product.count({ where: { status: "PENDING_APPROVAL" } }),
      db.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { name: true, quantity: true, total: true } },
        },
      }),
      db.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders,
        pendingVendors,
        pendingProducts,
        totalRevenue: revenue._sum.total || 0,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
