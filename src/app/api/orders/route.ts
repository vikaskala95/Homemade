import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import Razorpay from "razorpay";

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where: { userId: session.user.id },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true, images: true } },
              vendor: { select: { id: true, storeName: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPincode,
      couponCode,
      notes,
    } = body;

    // Validate shipping info
    if (!shippingName || !shippingPhone || !shippingAddress || !shippingCity || !shippingState || !shippingPincode) {
      return NextResponse.json({ error: "Complete shipping info required" }, { status: 400 });
    }

    // Get cart items
    const cart = await db.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                vendor: { select: { id: true, storeName: true } },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Validate stock
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `${item.product.name} has insufficient stock` },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    let subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    let discount = 0;
    let couponId: string | null = null;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode },
      });

      if (coupon && coupon.isActive && new Date() >= coupon.startDate && new Date() <= coupon.endDate) {
        if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
          if (!coupon.minOrder || subtotal >= coupon.minOrder) {
            if (coupon.type === "PERCENTAGE") {
              discount = (subtotal * coupon.value) / 100;
              if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
            } else {
              discount = coupon.value;
            }
            couponId = coupon.id;
          }
        }
      }
    }

    const deliveryCharge = subtotal >= 500 ? 0 : 50;
    const tax = Math.round((subtotal - discount) * 0.05 * 100) / 100; // 5% GST
    const total = Math.round((subtotal - discount + deliveryCharge + tax) * 100) / 100;

    // Create Razorpay order
    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(total * 100), // Razorpay uses paise
      currency: "INR",
      receipt: generateOrderNumber(),
      notes: {
        userId: session.user.id,
      },
    });

    // Create order in database
    const order = await db.order.create({
      data: {
        orderNumber: razorpayOrder.receipt as string,
        userId: session.user.id,
        subtotal,
        discount,
        deliveryCharge,
        tax,
        total,
        razorpayOrderId: razorpayOrder.id,
        couponId,
        shippingName,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingPincode,
        notes,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            vendorId: item.product.vendor.id,
            name: item.product.name,
            image: item.product.images[0] || null,
            price: item.product.price,
            quantity: item.quantity,
            total: item.product.price * item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({
      order,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
