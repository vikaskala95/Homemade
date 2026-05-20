"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { Store, Search, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function AdminVendorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (session?.user?.role !== "ADMIN") router.push("/");
    else fetchVendors();
  }, [session, status]);

  const fetchVendors = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/vendors?${params}`);
      const data = await res.json();
      setVendors(data.vendors || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { if (session?.user?.role === "ADMIN") { setLoading(true); fetchVendors(); } }, [statusFilter]);

  const handleAction = async (vendorId: string, action: "APPROVED" | "REJECTED") => {
    setActionLoading(vendorId);
    try {
      await fetch("/api/admin/vendors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, status: action }),
      });
      fetchVendors();
    } catch {} finally { setActionLoading(null); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Vendors</h1>
          <select className="px-3 py-2 border rounded-lg text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : vendors.length === 0 ? (
              <div className="text-center py-12 text-gray-500"><Store className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p>No vendors found</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-gray-500 bg-gray-50">
                    <th className="p-4 font-medium">Store</th>
                    <th className="p-4 font-medium">Owner</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Products</th>
                    <th className="p-4 font-medium">Revenue</th>
                    <th className="p-4 font-medium">Rating</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr></thead>
                  <tbody>
                    {vendors.map((v: any) => (
                      <tr key={v.id} className="border-b last:border-0">
                        <td className="p-4">
                          <p className="font-medium">{v.storeName}</p>
                          <p className="text-xs text-gray-400">{v.city}, {v.state}</p>
                        </td>
                        <td className="p-4">
                          <p>{v.user?.name}</p>
                          <p className="text-xs text-gray-400">{v.user?.email}</p>
                        </td>
                        <td className="p-4">
                          <Badge variant={v.status === "APPROVED" ? "success" : v.status === "REJECTED" ? "destructive" : "default"}>
                            {v.status}
                          </Badge>
                        </td>
                        <td className="p-4">{v._count?.products || 0}</td>
                        <td className="p-4">{formatPrice(v.totalRevenue || 0)}</td>
                        <td className="p-4">{(v.rating || 0).toFixed(1)}</td>
                        <td className="p-4">
                          {v.status === "PENDING" && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleAction(v.id, "APPROVED")} disabled={actionLoading === v.id}>
                                <CheckCircle className="h-4 w-4 mr-1" />Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleAction(v.id, "REJECTED")} disabled={actionLoading === v.id}>
                                <XCircle className="h-4 w-4 mr-1" />Reject
                              </Button>
                            </div>
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
