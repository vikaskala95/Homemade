import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/coupons - Validate a coupon code or list all (admin)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const isAdmin = searchParams.get("admin");

    // Admin: list all coupons
    if (isAdmin === "true") {
      const session = await auth();
      if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const user = await db.user.findUnique({ where: { id: session.user.id } });
      if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      const coupons = await db.coupon.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ coupons });
    }

    if (!code) {
      return NextResponse.json({ error: "Coupon code required" }, { status: 400 });
    }

    const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    if (new Date() < coupon.startDate || new Date() > coupon.endDate) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
    }

    return NextResponse.json({
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
        maxDiscount: coupon.maxDiscount,
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}

// POST /api/coupons - Create coupon (vendor or admin)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { vendor: true },
    });

    if (!user || (user.role !== "ADMIN" && !user.vendor)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { code, type, value, minOrder, maxDiscount, usageLimit, startDate, endDate } = body;

    if (!code || !type || !value || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        minOrder: minOrder || null,
        maxDiscount: maxDiscount || null,
        usageLimit: usageLimit || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        vendorId: user.vendor?.id || null,
        isActive: true,
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }
    console.error("Create coupon error:", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
