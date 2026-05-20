"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Search,
  Store,
  LogOut,
  LayoutDashboard,
  Package,
} from "lucide-react";
import { useState } from "react";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const { data: session } = useSession();
  const itemCount = useCartStore((s) => s.getItemCount());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-orange-600" />
            <span className="text-xl font-bold text-gray-900">
              Homemade<span className="text-orange-600">Everything</span>
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search homemade products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/products" className="text-sm text-gray-600 hover:text-orange-600 transition">
              Browse
            </Link>

            <ThemeToggle />

            {session ? (
              <>
                <Link href="/wishlist">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/cart" className="relative">
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </Link>

                <NotificationBell />

                {/* User menu */}
                <div className="relative group">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-500">{session.user?.email}</p>
                    </div>
                    <div className="p-1">
                      <Link href="/dashboard" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link href="/orders" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        <Package className="h-4 w-4" />
                        <span>Orders</span>
                      </Link>
                      {session.user?.role === "VENDOR" && (
                        <Link href="/vendor/dashboard" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                          <Store className="h-4 w-4" />
                          <span>Vendor Panel</span>
                        </Link>
                      )}
                      {session.user?.role === "ADMIN" && (
                        <Link href="/admin" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <button
                        onClick={() => signOut()}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link href="/products" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>
              Browse Products
            </Link>
            {session ? (
              <>
                <Link href="/cart" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  Cart ({itemCount})
                </Link>
                <Link href="/wishlist" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  Wishlist
                </Link>
                <Link href="/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/orders" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  Orders
                </Link>
                <button
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/auth/register" className="block px-3 py-2 text-orange-600 font-medium hover:bg-orange-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
