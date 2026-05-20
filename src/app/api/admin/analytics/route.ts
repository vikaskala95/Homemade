import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCached, setCache } from "@/lib/redis";

async function isAdmin() {
  const session = await auth();
  if (!session?.user?.id) return false;
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "ADMIN";
}

// GET /api/admin/analytics
export async function GET(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30"; // days
    const days = Math.min(parseInt(period), 365);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const cacheKey = `admin:analytics:${days}`;
    const cached = await getCached<any>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const [
      totalRevenue,
      periodRevenue,
      ordersByStatus,
      topProducts,
      topVendors,
      topCategories,
      newUsersCount,
      dailyOrders,
      recentSearches,
    ] = await Promise.all([
      // Total all-time revenue
      db.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      // Revenue in period
      db.order.aggregate({
        where: { paymentStatus: "PAID", createdAt: { gte: startDate } },
        _sum: { total: true },
        _count: true,
      }),
      // Orders by status
      db.order.groupBy({
        by: ["status"],
        _count: true,
        where: { createdAt: { gte: startDate } },
      }),
      // Top selling products
      db.product.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, name: true, slug: true, soldCount: true, rating: true, price: true, images: true },
        orderBy: { soldCount: "desc" },
        take: 10,
      }),
      // Top vendors by revenue
      db.vendor.findMany({
        where: { status: "APPROVED" },
        select: { id: true, storeName: true, slug: true, totalRevenue: true, totalSales: true, rating: true },
        orderBy: { totalRevenue: "desc" },
        take: 10,
      }),
      // Top categories by product count
      db.category.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
        orderBy: { products: { _count: "desc" } },
        take: 10,
      }),
      // New users in period
      db.user.count({ where: { createdAt: { gte: startDate } } }),
      // Daily order counts (last 30 days)
      db.order.groupBy({
        by: ["createdAt"],
        _count: true,
        _sum: { total: true },
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        orderBy: { createdAt: "asc" },
      }),
      // Top search queries
      db.searchQuery.groupBy({
        by: ["query"],
        _count: true,
        orderBy: { _count: { query: "desc" } },
        take: 20,
      }),
    ]);

    const result = {
      overview: {
        totalRevenue: totalRevenue._sum.total || 0,
        periodRevenue: periodRevenue._sum.total || 0,
        periodOrders: periodRevenue._count || 0,
        newUsers: newUsersCount,
        avgOrderValue: periodRevenue._count
          ? Math.round((periodRevenue._sum.total || 0) / periodRevenue._count)
          : 0,
      },
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      topProducts,
      topVendors,
      topCategories: topCategories.map((c) => ({
        ...c,
        productCount: c._count.products,
      })),
      dailyOrders: dailyOrders.map((d) => ({
        date: d.createdAt,
        orders: d._count,
        revenue: d._sum.total || 0,
      })),
      topSearches: recentSearches.map((s) => ({
        query: s.query,
        count: s._count,
      })),
    };

    await setCache(cacheKey, result, 300);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
