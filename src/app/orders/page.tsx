"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, timeAgo } from "@/lib/utils";
import { Package, Loader2 } from "lucide-react";

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) fetchOrders();
  }, [session]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    const map: Record<string, "success" | "destructive" | "default" | "secondary"> = {
      DELIVERED: "success",
      CONFIRMED: "default",
      PROCESSING: "default",
      SHIPPED: "default",
      CANCELLED: "destructive",
      REFUNDED: "secondary",
      PENDING: "secondary",
    };
    return map[status] || "secondary";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
              <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
              <Link href="/products"><Button>Browse Products</Button></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{timeAgo(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusColor(order.status)}>{order.status}</Badge>
                        <Badge variant={order.paymentStatus === "PAID" ? "success" : "secondary"}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">{item.name}</span>
                            <span className="text-gray-400">× {item.quantity}</span>
                          </div>
                          <span className="font-medium">{formatPrice(item.total)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <span className="font-semibold">Total: {formatPrice(order.total)}</span>
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
