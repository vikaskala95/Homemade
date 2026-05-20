import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/orders/[id]/invoice - Generate invoice HTML
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await db.order.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id },
          { items: { some: { vendor: { userId: session.user.id } } } },
        ],
      },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            vendor: { select: { storeName: true, gstNumber: true, address: true, city: true, state: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Admin can access any invoice
    if (!order && session.user.role === "ADMIN") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - ${order.orderNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #ea580c; padding-bottom: 20px; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #ea580c; }
    .invoice-title { font-size: 28px; color: #666; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .info-box { background: #f9fafb; padding: 15px; border-radius: 8px; }
    .info-box h3 { margin: 0 0 10px; color: #ea580c; font-size: 14px; text-transform: uppercase; }
    .info-box p { margin: 3px 0; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #f3f4f6; padding: 10px; text-align: left; font-size: 13px; border-bottom: 2px solid #e5e7eb; }
    td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .totals { text-align: right; }
    .totals td { border: none; }
    .total-row { font-weight: bold; font-size: 16px; color: #ea580c; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Homemade Everything</div>
      <p style="color: #666; font-size: 14px;">India's Premier Homemade Marketplace</p>
    </div>
    <div style="text-align: right;">
      <div class="invoice-title">INVOICE</div>
      <p style="font-size: 14px;">#${order.orderNumber}</p>
      <p style="font-size: 14px;">Date: ${new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h3>Bill To</h3>
      <p><strong>${order.shippingName}</strong></p>
      <p>${order.shippingAddress}</p>
      <p>${order.shippingCity}, ${order.shippingState} - ${order.shippingPincode}</p>
      <p>Phone: ${order.shippingPhone}</p>
      <p>Email: ${order.user.email}</p>
    </div>
    <div class="info-box">
      <h3>Payment Details</h3>
      <p>Status: <strong>${order.paymentStatus}</strong></p>
      <p>Method: ${order.paymentMethod || "Razorpay"}</p>
      ${order.razorpayPaymentId ? `<p>Transaction: ${order.razorpayPaymentId}</p>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Product</th>
        <th>Vendor</th>
        <th>Price</th>
        <th>Qty</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${order.items.map((item: any, i: number) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.name}</td>
        <td>${item.vendor.storeName}</td>
        <td>₹${item.price.toLocaleString("en-IN")}</td>
        <td>${item.quantity}</td>
        <td style="text-align: right;">₹${item.total.toLocaleString("en-IN")}</td>
      </tr>
      `).join("")}
    </tbody>
  </table>

  <table class="totals" style="width: 300px; margin-left: auto;">
    <tr><td>Subtotal:</td><td>₹${order.subtotal.toLocaleString("en-IN")}</td></tr>
    ${order.discount > 0 ? `<tr><td>Discount:</td><td>-₹${order.discount.toLocaleString("en-IN")}</td></tr>` : ""}
    <tr><td>Delivery:</td><td>₹${order.deliveryCharge.toLocaleString("en-IN")}</td></tr>
    <tr><td>GST (5%):</td><td>₹${order.tax.toLocaleString("en-IN")}</td></tr>
    <tr class="total-row"><td>Total:</td><td>₹${order.total.toLocaleString("en-IN")}</td></tr>
  </table>

  <div class="footer">
    <p>Thank you for shopping with Homemade Everything!</p>
    <p>support@homemadeeverything.com | www.homemadeeverything.com</p>
    <p>This is a computer-generated invoice and does not require a signature.</p>
  </div>
</body>
</html>`;

    return new NextResponse(invoiceHtml, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="invoice-${order.orderNumber}.html"`,
      },
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
