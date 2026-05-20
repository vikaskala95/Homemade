import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Update order status
    const order = await db.order.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentMethod: "razorpay",
      },
      include: { items: true },
    });

    // Update product stock and sold count
    for (const item of order.items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          soldCount: { increment: item.quantity },
        },
      });
    }

    // Update vendor sales
    const vendorTotals = new Map<string, { sales: number; revenue: number }>();
    for (const item of order.items) {
      const existing = vendorTotals.get(item.vendorId) || { sales: 0, revenue: 0 };
      vendorTotals.set(item.vendorId, {
        sales: existing.sales + item.quantity,
        revenue: existing.revenue + item.total,
      });
    }

    for (const [vendorId, totals] of vendorTotals) {
      await db.vendor.update({
        where: { id: vendorId },
        data: {
          totalSales: { increment: totals.sales },
          totalRevenue: { increment: totals.revenue },
        },
      });
    }

    // Update coupon usage
    if (order.couponId) {
      await db.coupon.update({
        where: { id: order.couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Clear cart
    const cart = await db.cart.findUnique({
      where: { userId: session.user.id },
    });
    if (cart) {
      await db.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    // Create notification
    await db.notification.create({
      data: {
        userId: session.user.id,
        type: "ORDER",
        title: "Order Confirmed!",
        message: `Your order #${order.orderNumber} has been confirmed.`,
        link: `/orders/${order.id}`,
      },
    });

    return NextResponse.json({
      message: "Payment verified successfully",
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
