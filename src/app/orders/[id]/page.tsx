"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Package, MapPin, CreditCard, Loader2 } from "lucide-react";

const statusColor: Record<string, string> = {
  PENDING: "default",
  CONFIRMED: "secondary",
  PROCESSING: "secondary",
  SHIPPED: "secondary",
  DELIVERED: "success",
  CANCELLED: "destructive",
  REFUNDED: "destructive",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Order not found</h2>
            <Link href="/orders"><Button>Back to Orders</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/orders"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Orders</Button></Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
              <p className="text-sm text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <Badge variant={statusColor[order.status] as any || "default"}>
              {order.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Items */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Items ({order.items.length})</CardTitle></CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product?.images?.[0] ? (
                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400"><Package className="h-6 w-6" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.product?.slug || ""}`} className="font-medium hover:text-orange-600 line-clamp-1">
                            {item.productName}
                          </Link>
                          <p className="text-sm text-gray-500">by {item.vendor?.storeName || "Vendor"}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card>
                <CardHeader><CardTitle>Order Timeline</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { status: "Order Placed", date: order.createdAt, done: true },
                      { status: "Confirmed", date: order.status !== "PENDING" ? order.updatedAt : null, done: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) },
                      { status: "Processing", date: null, done: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) },
                      { status: "Shipped", date: null, done: ["SHIPPED", "DELIVERED"].includes(order.status) },
                      { status: "Delivered", date: null, done: order.status === "DELIVERED" },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${step.done ? "bg-green-500" : "bg-gray-200"}`} />
                        <div>
                          <p className={`text-sm font-medium ${step.done ? "text-gray-900" : "text-gray-400"}`}>{step.status}</p>
                          {step.date && <p className="text-xs text-gray-400">{new Date(step.date).toLocaleString("en-IN")}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Payment Summary */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Payment</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span>{order.shippingCost > 0 ? formatPrice(order.shippingCost) : "Free"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                  <div className="pt-2">
                    <Badge variant={order.paymentStatus === "COMPLETED" ? "success" : "default"}>
                      Payment: {order.paymentStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              {order.address && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Delivery Address</CardTitle></CardHeader>
                  <CardContent>
                    <p className="font-medium">{order.address.name}</p>
                    <p className="text-sm text-gray-600">{order.address.address}</p>
                    <p className="text-sm text-gray-600">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                    <p className="text-sm text-gray-600">Phone: {order.address.phone}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
