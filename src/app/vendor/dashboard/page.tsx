"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Plus,
  Store,
  BarChart3,
  Settings,
  TrendingUp,
  Eye,
} from "lucide-react";

export default function VendorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    fetchVendorData();
  }, [status, router]);

  const fetchVendorData = async () => {
    try {
      const [vendorRes, productsRes] = await Promise.all([
        fetch("/api/vendor/profile"),
        fetch("/api/vendor/products?limit=10"),
      ]);

      if (vendorRes.ok) {
        const vendorData = await vendorRes.json();
        setVendor(vendorData.vendor);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
      }
    } catch {
      console.error("Failed to fetch vendor data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Not a Vendor Yet</h2>
          <p className="text-gray-500 mb-6">Register as a vendor to start selling</p>
          <Link href="/vendor/register"><Button>Register as Vendor</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-6 hidden lg:block">
        <div className="flex items-center space-x-2 mb-10">
          <Store className="h-8 w-8 text-orange-500" />
          <div>
            <span className="text-lg font-bold block">{vendor.storeName}</span>
            <Badge variant={vendor.status === "APPROVED" ? "success" : "default"} className="mt-1">
              {vendor.status}
            </Badge>
          </div>
        </div>

        <nav className="space-y-2">
          {[
            { name: "Dashboard", href: "/vendor/dashboard", icon: BarChart3 },
            { name: "Products", href: "/vendor/products", icon: Package },
            { name: "Orders", href: "/vendor/orders", icon: ShoppingCart },
            { name: "Analytics", href: "/vendor/analytics", icon: TrendingUp },
            { name: "Settings", href: "/vendor/settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-white">← Back to Store</Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
            <p className="text-gray-500">Welcome back, {session?.user?.name}</p>
          </div>
          {vendor.status === "APPROVED" && (
            <Link href="/vendor/products/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          )}
        </div>

        {vendor.status === "PENDING" && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <p className="font-semibold text-amber-800">Your vendor application is under review</p>
              <p className="text-sm text-amber-600 mt-1">
                Our team will review and approve your application soon. You&apos;ll be notified once approved.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold mt-1">{products.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <p className="text-2xl font-bold mt-1">{vendor.totalSales}</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                  <ShoppingCart className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold mt-1">{formatPrice(vendor.totalRevenue)}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-50 text-green-600">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Store Rating</p>
                  <p className="text-2xl font-bold mt-1">{vendor.rating.toFixed(1)}/5</p>
                </div>
                <div className="p-3 rounded-xl bg-yellow-50 text-yellow-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Products</CardTitle>
            <Link href="/vendor/products">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Stock</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Views</th>
                    <th className="pb-3 font-medium">Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => (
                    <tr key={product.id} className="border-b last:border-0">
                      <td className="py-3">
                        <Link href={`/vendor/products/${product.id}`} className="font-medium hover:text-orange-600">
                          {product.name}
                        </Link>
                      </td>
                      <td className="py-3">{formatPrice(product.price)}</td>
                      <td className="py-3">{product.stock}</td>
                      <td className="py-3">
                        <Badge variant={product.status === "ACTIVE" ? "success" : product.status === "REJECTED" ? "destructive" : "default"}>
                          {product.status}
                        </Badge>
                      </td>
                      <td className="py-3 flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{product.viewCount}</td>
                      <td className="py-3">{product.soldCount}</td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">No products yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
