import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/vendor/analytics
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vendor = await db.vendor.findUnique({ where: { userId: session.user.id } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      recentOrders,
      productStats,
      topProducts,
      recentReviews,
      revenue30d,
    ] = await Promise.all([
      db.orderItem.count({ where: { vendorId: vendor.id } }),
      db.orderItem.count({ where: { vendorId: vendor.id, createdAt: { gte: thirtyDaysAgo } } }),
      db.product.aggregate({
        where: { vendorId: vendor.id },
        _count: true,
        _sum: { viewCount: true, soldCount: true },
        _avg: { rating: true },
      }),
      db.product.findMany({
        where: { vendorId: vendor.id, status: "ACTIVE" },
        select: { id: true, name: true, soldCount: true, viewCount: true, rating: true, price: true, images: true },
        orderBy: { soldCount: "desc" },
        take: 10,
      }),
      db.review.findMany({
        where: { product: { vendorId: vendor.id } },
        include: {
          user: { select: { name: true, image: true } },
          product: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.orderItem.aggregate({
        where: { vendorId: vendor.id, createdAt: { gte: thirtyDaysAgo } },
        _sum: { total: true },
      }),
    ]);

    return NextResponse.json({
      overview: {
        totalOrders,
        recentOrders,
        totalProducts: productStats._count,
        totalViews: productStats._sum.viewCount || 0,
        totalSold: productStats._sum.soldCount || 0,
        avgRating: productStats._avg.rating || 0,
        revenue30d: revenue30d._sum.total || 0,
        commission: vendor.commission,
      },
      topProducts,
      recentReviews,
    });
  } catch (error) {
    console.error("Vendor analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
