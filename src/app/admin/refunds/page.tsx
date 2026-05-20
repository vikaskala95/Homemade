"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { RotateCcw, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminRefundsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (session?.user?.role !== "ADMIN") router.push("/");
    else fetchRefunds();
  }, [session, status, statusFilter]);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/refunds?${params}`);
      const data = await res.json();
      setRefunds(data.refunds || []);
    } catch {} finally { setLoading(false); }
  };

  const handleAction = async (refundId: string, action: string) => {
    setActionLoading(refundId);
    try {
      const res = await fetch("/api/admin/refunds", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refundId, status: action }),
      });
      if (res.ok) {
        toast.success(`Refund ${action.toLowerCase()}`);
        fetchRefunds();
      }
    } catch {
      toast.error("Action failed");
    } finally { setActionLoading(null); }
  };

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-blue-100 text-blue-800",
    REJECTED: "bg-red-100 text-red-800",
    PROCESSED: "bg-green-100 text-green-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Refunds</h1>
          <select className="px-3 py-2 border rounded-lg text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="PROCESSED">Processed</option>
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : refunds.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <RotateCcw className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No refund requests</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-gray-500 bg-gray-50">
                    <th className="p-4">Order</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Actions</th>
                  </tr></thead>
                  <tbody>
                    {refunds.map((refund) => (
                      <tr key={refund.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{refund.order?.orderNumber || "N/A"}</td>
                        <td className="p-4">{formatPrice(refund.amount)}</td>
                        <td className="p-4 max-w-xs truncate">{refund.reason}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[refund.status] || ""}`}>
                            {refund.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">{new Date(refund.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          {refund.status === "PENDING" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-xs"
                                onClick={() => handleAction(refund.id, "APPROVED")}
                                disabled={actionLoading === refund.id}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 text-xs"
                                onClick={() => handleAction(refund.id, "REJECTED")}
                                disabled={actionLoading === refund.id}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {refund.status === "APPROVED" && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-xs"
                              onClick={() => handleAction(refund.id, "PROCESSED")}
                              disabled={actionLoading === refund.id}
                            >
                              Process Refund
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
