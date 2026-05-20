"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/product/product-card";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) fetchWishlist();
  }, [session]);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      setItems(data.wishlist || []);
    } catch {
      console.error("Failed to fetch wishlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h1>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Wishlist is empty</h2>
              <p className="text-gray-500 mb-6">Save products you love for later</p>
              <Link href="/products"><Button>Browse Products</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item: any) => (
                <ProductCard key={item.id} product={item.product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
