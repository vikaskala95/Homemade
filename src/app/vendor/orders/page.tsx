"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Store, Package, BarChart3, TrendingUp, Settings, Loader2 } from "lucide-react";

export default function VendorOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/vendor/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  };

  const statusColor: Record<string, string> = {
    PENDING: "default", CONFIRMED: "secondary", PROCESSING: "secondary",
    SHIPPED: "secondary", DELIVERED: "success", CANCELLED: "destructive",
  };

  const sidebarItems = [
    { name: "Dashboard", href: "/vendor/dashboard", icon: BarChart3 },
    { name: "Products", href: "/vendor/products", icon: Package },
    { name: "Orders", href: "/vendor/orders", icon: ShoppingCart },
    { name: "Analytics", href: "/vendor/analytics", icon: TrendingUp },
    { name: "Settings", href: "/vendor/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-6 hidden lg:block">
        <div className="flex items-center space-x-2 mb-10">
          <Store className="h-8 w-8 text-orange-500" />
          <span className="text-lg font-bold">Vendor Panel</span>
        </div>
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/vendor/orders";
            return (
              <Link key={item.name} href={item.href} className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${active ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}>
                <Icon className="h-5 w-5" /><span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-white">← Back to Store</Link>
        </div>
      </div>

      <div className="lg:ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Orders</h1>
          <select className="px-3 py-2 border rounded-lg text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No orders found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-left text-gray-500 bg-gray-50">
                      <th className="p-4 font-medium">Order #</th>
                      <th className="p-4 font-medium">Product</th>
                      <th className="p-4 font-medium">Qty</th>
                      <th className="p-4 font-medium">Amount</th>
                      <th className="p-4 font-medium">Payment</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Date</th>
                    </tr></thead>
                    <tbody>
                      {orders.map((item: any) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="p-4 font-mono text-xs">{item.order?.orderNumber}</td>
                          <td className="p-4">
                            <p className="font-medium max-w-[180px] truncate">{item.productName}</p>
                          </td>
                          <td className="p-4">{item.quantity}</td>
                          <td className="p-4 font-medium">{formatPrice(item.price * item.quantity)}</td>
                          <td className="p-4">
                            <Badge variant={item.order?.paymentStatus === "COMPLETED" ? "success" : "default"}>
                              {item.order?.paymentStatus}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant={statusColor[item.order?.status] as any || "default"}>
                              {item.order?.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-gray-500 whitespace-nowrap">
                            {new Date(item.order?.createdAt).toLocaleDateString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 p-4">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
                    <span className="px-3 py-1.5 text-sm text-gray-500">Page {page} of {pagination.totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
