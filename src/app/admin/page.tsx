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
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  AlertCircle,
  BarChart3,
  Settings,
  ShieldCheck,
  Layers,
} from "lucide-react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data.stats);
      setRecentOrders(data.recentOrders || []);
    } catch {
      console.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </div>
    );
  }

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-600 bg-blue-50" },
    { title: "Active Vendors", value: stats.totalVendors, icon: Store, color: "text-green-600 bg-green-50" },
    { title: "Total Products", value: stats.totalProducts, icon: Package, color: "text-purple-600 bg-purple-50" },
    { title: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-orange-600 bg-orange-50" },
    { title: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
    { title: "Pending Vendors", value: stats.pendingVendors, icon: Clock, color: "text-amber-600 bg-amber-50" },
    { title: "Pending Products", value: stats.pendingProducts, icon: AlertCircle, color: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-6 hidden lg:block">
        <div className="flex items-center space-x-2 mb-10">
          <ShieldCheck className="h-8 w-8 text-orange-500" />
          <span className="text-lg font-bold">Admin Panel</span>
        </div>

        <nav className="space-y-2">
          {[
            { name: "Dashboard", href: "/admin", icon: BarChart3 },
            { name: "Vendors", href: "/admin/vendors", icon: Store },
            { name: "Products", href: "/admin/products", icon: Package },
            { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
            { name: "Users", href: "/admin/users", icon: Users },
            { name: "Categories", href: "/admin/categories", icon: Layers },
            { name: "Settings", href: "/admin/settings", icon: Settings },
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
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            ← Back to Store
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {session?.user?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        {(stats.pendingVendors > 0 || stats.pendingProducts > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {stats.pendingVendors > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-amber-800">{stats.pendingVendors} Vendor(s) awaiting approval</p>
                    <p className="text-sm text-amber-600">Review and approve vendor applications</p>
                  </div>
                  <Link href="/admin/vendors?status=PENDING">
                    <Button size="sm">Review</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
            {stats.pendingProducts > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-orange-800">{stats.pendingProducts} Product(s) awaiting approval</p>
                    <p className="text-sm text-orange-600">Review and approve product listings</p>
                  </div>
                  <Link href="/admin/products?status=PENDING_APPROVAL">
                    <Button size="sm">Review</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/admin/orders">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Order #</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Items</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{order.orderNumber}</td>
                      <td className="py-3">{order.user?.name || "N/A"}</td>
                      <td className="py-3">{order.items?.length || 0}</td>
                      <td className="py-3 font-medium">{formatPrice(order.total)}</td>
                      <td className="py-3">
                        <Badge variant={order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" ? "destructive" : "default"}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge variant={order.paymentStatus === "PAID" ? "success" : "secondary"}>
                          {order.paymentStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No orders yet
                      </td>
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
