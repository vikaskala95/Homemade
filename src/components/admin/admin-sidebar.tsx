"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, Store, Package, ShoppingCart, Users, Layers, Settings, ShieldCheck, TrendingUp, RotateCcw, Bell, FileText, DollarSign, Ticket,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: BarChart3 },
  { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
  { name: "Vendors", href: "/admin/vendors", icon: Store },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Refunds", href: "/admin/refunds", icon: RotateCcw },
  { name: "Payouts", href: "/admin/payouts", icon: DollarSign },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Categories", href: "/admin/categories", icon: Layers },
  { name: "Coupons", href: "/admin/coupons", icon: Ticket },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Banners", href: "/admin/banners", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-6 hidden lg:block z-40">
      <div className="flex items-center space-x-2 mb-10">
        <ShieldCheck className="h-8 w-8 text-orange-500" />
        <span className="text-lg font-bold">Admin Panel</span>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${
                active ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
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
  );
}
