"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import {
  BarChart3, TrendingUp, Users, ShoppingCart, DollarSign, Package, Search, Loader2,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (session?.user?.role !== "ADMIN") router.push("/");
    else fetchAnalytics();
  }, [session, status, period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      const data = await res.json();
      setAnalytics(data);
    } catch {} finally { setLoading(false); }
  };

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="lg:ml-64 p-6 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <select
            className="px-3 py-2 border rounded-lg text-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { title: "Total Revenue", value: formatPrice(analytics.overview.totalRevenue), icon: DollarSign, color: "text-green-600 bg-green-50" },
            { title: `Revenue (${period}d)`, value: formatPrice(analytics.overview.periodRevenue), icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
            { title: `Orders (${period}d)`, value: analytics.overview.periodOrders, icon: ShoppingCart, color: "text-orange-600 bg-orange-50" },
            { title: "Avg Order Value", value: formatPrice(analytics.overview.avgOrderValue), icon: BarChart3, color: "text-purple-600 bg-purple-50" },
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

        {/* Orders by Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader><CardTitle className="text-lg">Orders by Status</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.ordersByStatus.map((item: any) => {
                  const colors: Record<string, string> = {
                    PENDING: "bg-yellow-500", CONFIRMED: "bg-blue-500", PROCESSING: "bg-indigo-500",
                    SHIPPED: "bg-purple-500", DELIVERED: "bg-green-500", CANCELLED: "bg-red-500", REFUNDED: "bg-gray-500",
                  };
                  const total = analytics.ordersByStatus.reduce((s: number, i: any) => s + i.count, 0);
                  const pct = total ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <div key={item.status} className="flex items-center gap-3">
                      <div className="w-24 text-sm font-medium">{item.status}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div className={`h-full rounded-full ${colors[item.status] || "bg-gray-400"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="w-16 text-sm text-right text-gray-600">{item.count} ({pct}%)</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">New Users ({period}d)</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Users className="h-12 w-12 text-blue-500" />
                <div>
                  <p className="text-3xl font-bold">{analytics.overview.newUsers}</p>
                  <p className="text-sm text-gray-500">new registrations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products & Vendors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader><CardTitle className="text-lg">Top Selling Products</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topProducts.map((p: any, i: number) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">{formatPrice(p.price)} · ⭐ {p.rating.toFixed(1)}</p>
                    </div>
                    <div className="text-sm font-semibold text-orange-600">{p.soldCount} sold</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Top Vendors</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topVendors.map((v: any, i: number) => (
                  <div key={v.id} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{v.storeName}</p>
                      <p className="text-xs text-gray-500">{v.totalSales} sales · ⭐ {v.rating.toFixed(1)}</p>
                    </div>
                    <div className="text-sm font-semibold text-green-600">{formatPrice(v.totalRevenue)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Categories & Search Queries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Top Categories</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topCategories.map((c: any, i: number) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                      <span className="text-sm">{c.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{c.productCount} products</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Search className="h-4 w-4" /> Top Searches</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.topSearches.length === 0 ? (
                  <p className="text-sm text-gray-500">No search data yet</p>
                ) : (
                  analytics.topSearches.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm">&ldquo;{s.query}&rdquo;</span>
                      <span className="text-xs text-gray-500">{s.count} searches</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
