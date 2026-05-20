"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, Loader2, Package, Store, DollarSign, Info } from "lucide-react";

const typeIcons: Record<string, any> = {
  ORDER_PLACED: Package,
  ORDER_STATUS: Package,
  VENDOR_APPROVED: Store,
  VENDOR_REJECTED: Store,
  PAYMENT_RECEIVED: DollarSign,
  PRODUCT_APPROVED: Package,
  PRODUCT_REJECTED: Package,
  NEW_REVIEW: Info,
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) fetchNotifications();
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {} finally { setLoading(false); }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead}>
                <Check className="h-4 w-4 mr-1" />Mark all read
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto" /></div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h2>
              <p className="text-gray-500">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n: any) => {
                const Icon = typeIcons[n.type] || Info;
                return (
                  <Card key={n.id} className={!n.isRead ? "border-orange-200 bg-orange-50/50" : ""}>
                    <CardContent className="p-4 flex gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${!n.isRead ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.isRead ? "font-medium" : "text-gray-600"}`}>{n.title}</p>
                        {n.message && <p className="text-xs text-gray-500 mt-1">{n.message}</p>}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>
                      {!n.isRead && <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2" />}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
