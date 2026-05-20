import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vendor = await db.vendor.findUnique({ where: { userId: session.user.id } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 403 });

    const coupons = await db.coupon.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Vendor coupons error:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}
