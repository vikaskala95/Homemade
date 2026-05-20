"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { Package, Plus, Search, Eye, Store, BarChart3, ShoppingCart, TrendingUp, Settings } from "lucide-react";

export default function VendorProductsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, [page, statusFilter]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/vendor/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setPagination(data.pagination);
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const filtered = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

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
            const active = item.href === "/vendor/products";
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
          <h1 className="text-2xl font-bold">Products</h1>
          <Link href="/vendor/products/new">
            <Button><Plus className="h-4 w-4 mr-2" />Add Product</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input className="pl-9 w-64" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_APPROVAL">Pending</option>
                <option value="REJECTED">Rejected</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-3 font-medium">Product</th>
                        <th className="pb-3 font-medium">Category</th>
                        <th className="pb-3 font-medium">Price</th>
                        <th className="pb-3 font-medium">Stock</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Views</th>
                        <th className="pb-3 font-medium">Sold</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((product: any) => (
                        <tr key={product.id} className="border-b last:border-0">
                          <td className="py-3 font-medium max-w-[200px] truncate">{product.name}</td>
                          <td className="py-3 text-gray-500">{product.category?.name || "—"}</td>
                          <td className="py-3">{formatPrice(product.price)}</td>
                          <td className="py-3">{product.stock}</td>
                          <td className="py-3">
                            <Badge variant={product.status === "ACTIVE" ? "success" : product.status === "REJECTED" ? "destructive" : "default"}>
                              {product.status.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="py-3"><span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{product.viewCount}</span></td>
                          <td className="py-3">{product.soldCount}</td>
                          <td className="py-3">
                            <Link href={`/vendor/products/${product.id}/edit`}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
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
