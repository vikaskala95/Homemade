"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "./product-card";
import { Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  rating: number;
  reviewCount: number;
  isOrganic: boolean;
  isFeatured: boolean;
  stock: number;
  vendor: { id: string; storeName: string; slug: string };
}

interface ProductRecommendationsProps {
  type?: "trending" | "similar" | "personalized" | "new-arrivals";
  productId?: string;
  title?: string;
  limit?: number;
}

export function ProductRecommendations({
  type = "trending",
  productId,
  title,
  limit = 4,
}: ProductRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const params = new URLSearchParams({ type, limit: limit.toString() });
        if (productId) params.set("productId", productId);

        const res = await fetch(`/api/products/recommendations?${params}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [type, productId, limit]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
      </div>
    );
  }

  if (products.length === 0) return null;

  const defaultTitles: Record<string, string> = {
    trending: "Trending Products",
    similar: "Similar Products",
    personalized: "Recommended for You",
    "new-arrivals": "New Arrivals",
  };

  return (
    <section className="py-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {title || defaultTitles[type]}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
