"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Loader2 } from "lucide-react";

const statusOptions = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/auth/login");
    else if (session?.user?.role !== "ADMIN") router.push("/");
    else fetchOrders();
  }, [session, authStatus, page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      fetchOrders();
    } catch {} finally { setUpdatingId(null); }
  };

  const statusColor: Record<string, string> = {
    PENDING: "default", CONFIRMED: "secondary", PROCESSING: "secondary",
    SHIPPED: "secondary", DELIVERED: "success", CANCELLED: "destructive",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Orders</h1>
          <select className="px-3 py-2 border rounded-lg text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500"><ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p>No orders found</p></div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-left text-gray-500 bg-gray-50">
                      <th className="p-4 font-medium">Order #</th>
                      <th className="p-4 font-medium">Customer</th>
                      <th className="p-4 font-medium">Items</th>
                      <th className="p-4 font-medium">Total</th>
                      <th className="p-4 font-medium">Payment</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Update</th>
                    </tr></thead>
                    <tbody>
                      {orders.map((o: any) => (
                        <tr key={o.id} className="border-b last:border-0">
                          <td className="p-4 font-mono text-xs">{o.orderNumber}</td>
                          <td className="p-4">
                            <p className="font-medium">{o.user?.name || "—"}</p>
                            <p className="text-xs text-gray-400">{o.user?.email}</p>
                          </td>
                          <td className="p-4">{o.items?.length || 0}</td>
                          <td className="p-4 font-medium">{formatPrice(o.total)}</td>
                          <td className="p-4">
                            <Badge variant={o.paymentStatus === "COMPLETED" ? "success" : "default"}>{o.paymentStatus}</Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant={statusColor[o.status] as any || "default"}>{o.status}</Badge>
                          </td>
                          <td className="p-4 text-gray-500 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                          <td className="p-4">
                            <select
                              className="px-2 py-1 border rounded text-xs"
                              value={o.status}
                              onChange={(e) => updateStatus(o.id, e.target.value)}
                              disabled={updatingId === o.id || o.status === "DELIVERED" || o.status === "CANCELLED"}
                            >
                              {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
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
