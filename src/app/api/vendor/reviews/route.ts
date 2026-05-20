import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vendor = await db.vendor.findUnique({ where: { userId: session.user.id } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 403 });

    const reviews = await db.review.findMany({
      where: { product: { vendorId: vendor.id } },
      include: {
        user: { select: { name: true, image: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Calculate stats
    const total = reviews.length;
    const avg = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const breakdown = [0, 0, 0, 0, 0];
    reviews.forEach((r) => { breakdown[r.rating - 1]++; });

    return NextResponse.json({
      reviews,
      stats: { avg, total, breakdown },
    });
  } catch (error) {
    console.error("Vendor reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
