"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import {
  Package, ShoppingCart, DollarSign, Eye, Star, TrendingUp, BarChart3, Settings, Store, Loader2,
} from "lucide-react";

export default function VendorAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else fetchAnalytics();
  }, [status]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/vendor/analytics");
      if (res.ok) setAnalytics(await res.json());
    } catch {} finally { setLoading(false); }
  };

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  const { overview, topProducts, recentReviews } = analytics;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Vendor Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-6 hidden lg:block z-40">
        <div className="flex items-center space-x-2 mb-10">
          <Store className="h-8 w-8 text-orange-500" />
          <span className="text-lg font-bold">Vendor Panel</span>
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
              <Link key={item.name} href={item.href}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition">
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
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { title: "Revenue (30d)", value: formatPrice(overview.revenue30d), icon: DollarSign, color: "text-green-600 bg-green-50" },
            { title: "Orders (30d)", value: overview.recentOrders, icon: ShoppingCart, color: "text-orange-600 bg-orange-50" },
            { title: "Total Views", value: overview.totalViews.toLocaleString(), icon: Eye, color: "text-blue-600 bg-blue-50" },
            { title: "Avg Rating", value: overview.avgRating.toFixed(1), icon: Star, color: "text-yellow-600 bg-yellow-50" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}><Icon className="h-6 w-6" /></div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-sm text-gray-500 mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
          Commission Rate: <strong>{overview.commission}%</strong> · Your net earnings are {100 - overview.commission}% of each sale.
        </div>

        {/* Top Products & Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Top Selling Products</CardTitle></CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <p className="text-gray-500 text-sm">No products yet</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p: any, i: number) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-10 rounded object-cover" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">{formatPrice(p.price)} · {p.viewCount} views</p>
                      </div>
                      <div className="text-sm font-semibold text-orange-600">{p.soldCount} sold</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Recent Reviews</CardTitle></CardHeader>
            <CardContent>
              {recentReviews.length === 0 ? (
                <p className="text-gray-500 text-sm">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {recentReviews.map((r: any) => (
                    <div key={r.id} className="border-b pb-3 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{r.user.name || "Anonymous"}</span>
                        <span className="text-yellow-500 text-xs">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">on {r.product.name}</p>
                      {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
