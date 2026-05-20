import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    switch (eventType) {
      case "payment.captured": {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;

        await db.order.updateMany({
          where: { razorpayOrderId: orderId },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            razorpayPaymentId: payment.id,
          },
        });
        break;
      }

      case "payment.failed": {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;

        await db.order.updateMany({
          where: { razorpayOrderId: orderId },
          data: {
            paymentStatus: "FAILED",
            status: "CANCELLED",
          },
        });
        break;
      }

      case "refund.created": {
        const refund = payload.refund.entity;
        const paymentId = refund.payment_id;

        await db.order.updateMany({
          where: { razorpayPaymentId: paymentId },
          data: {
            paymentStatus: "REFUNDED",
            status: "REFUNDED",
          },
        });
        break;
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
