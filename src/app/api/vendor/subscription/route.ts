import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const PLANS = {
  FREE: { name: "Free", price: 0, features: ["5 products", "Basic analytics", "Email support"] },
  BASIC: { name: "Basic", price: 499, features: ["25 products", "Advanced analytics", "Priority support", "Featured listing (1)"] },
  PREMIUM: { name: "Premium", price: 999, features: ["Unlimited products", "Full analytics", "24/7 support", "Featured listings (5)", "Promoted products"] },
  ENTERPRISE: { name: "Enterprise", price: 2499, features: ["Unlimited everything", "Dedicated manager", "Custom branding", "API access", "Bulk upload"] },
};

// GET /api/vendor/subscription - Get current subscription
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vendor = await db.vendor.findUnique({ where: { userId: session.user.id } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const subscription = await db.subscription.findFirst({
      where: { vendorId: vendor.id, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      subscription: subscription || { plan: "FREE", isActive: true },
      plans: PLANS,
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
  }
}

// POST /api/vendor/subscription - Subscribe to a plan
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vendor = await db.vendor.findUnique({ where: { userId: session.user.id } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const { plan } = await req.json();

    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planDetails = PLANS[plan as keyof typeof PLANS];

    // Deactivate existing subscriptions
    await db.subscription.updateMany({
      where: { vendorId: vendor.id, isActive: true },
      data: { isActive: false },
    });

    // Create new subscription
    const subscription = await db.subscription.create({
      data: {
        vendorId: vendor.id,
        plan,
        price: planDetails.price,
        features: planDetails.features,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
      },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
