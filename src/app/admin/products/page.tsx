"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { Package, Search, CheckCircle, Star, Loader2 } from "lucide-react";

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (session?.user?.role !== "ADMIN") router.push("/");
    else fetchProducts();
  }, [session, status, page, statusFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  };

  const handleApprove = async (productId: string) => {
    setActionLoading(productId);
    try {
      await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, status: "ACTIVE" }),
      });
      fetchProducts();
    } catch {} finally { setActionLoading(null); }
  };

  const handleFeature = async (productId: string, featured: boolean) => {
    setActionLoading(productId);
    try {
      await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, isFeatured: !featured }),
      });
      fetchProducts();
    } catch {} finally { setActionLoading(null); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <select className="px-3 py-2 border rounded-lg text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_APPROVAL">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-gray-500"><Package className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p>No products found</p></div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-left text-gray-500 bg-gray-50">
                      <th className="p-4 font-medium">Product</th>
                      <th className="p-4 font-medium">Vendor</th>
                      <th className="p-4 font-medium">Price</th>
                      <th className="p-4 font-medium">Stock</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr></thead>
                    <tbody>
                      {products.map((p: any) => (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="p-4">
                            <p className="font-medium max-w-[200px] truncate">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.category?.name}</p>
                          </td>
                          <td className="p-4 text-gray-500">{p.vendor?.storeName}</td>
                          <td className="p-4">{formatPrice(p.price)}</td>
                          <td className="p-4">{p.stock}</td>
                          <td className="p-4">
                            <Badge variant={p.status === "ACTIVE" ? "success" : p.status === "REJECTED" ? "destructive" : "default"}>
                              {p.status.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              {p.status === "PENDING_APPROVAL" && (
                                <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleApprove(p.id)} disabled={actionLoading === p.id}>
                                  <CheckCircle className="h-4 w-4 mr-1" />Approve
                                </Button>
                              )}
                              <Button size="sm" variant="outline" onClick={() => handleFeature(p.id, p.isFeatured)} disabled={actionLoading === p.id}>
                                <Star className={`h-4 w-4 mr-1 ${p.isFeatured ? "fill-yellow-400 text-yellow-400" : ""}`} />
                                {p.isFeatured ? "Unfeature" : "Feature"}
                              </Button>
                            </div>
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
