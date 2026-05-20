"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  Heart,
  MapPin,
  Bell,
  User,
  ShoppingBag,
  Store,
  Settings,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();

  const menuItems = [
    { name: "My Orders", href: "/orders", icon: Package, desc: "Track and manage your orders" },
    { name: "Wishlist", href: "/wishlist", icon: Heart, desc: "Products you've saved" },
    { name: "Addresses", href: "/dashboard/addresses", icon: MapPin, desc: "Manage delivery addresses" },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell, desc: "View your notifications" },
    { name: "Profile", href: "/dashboard/profile", icon: User, desc: "Edit your profile" },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, desc: "Account settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {session?.user?.name || "User"}!
            </h1>
            <p className="text-gray-500">{session?.user?.email}</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Link href="/products">
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Continue Shopping</p>
                    <p className="text-sm text-gray-500">Browse products</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            {session?.user?.role === "CUSTOMER" && (
              <Link href="/vendor/register">
                <Card className="hover:shadow-md transition cursor-pointer">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-50 text-green-600">
                      <Store className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">Become a Vendor</p>
                      <p className="text-sm text-gray-500">Start selling your products</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>

          {/* Menu Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.name} href={item.href}>
                      <div className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
                        <Icon className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
