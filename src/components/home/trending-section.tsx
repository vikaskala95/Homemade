"use client";

import { ProductRecommendations } from "@/components/product/product-recommendations";

export function TrendingAndNewArrivals() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ProductRecommendations type="trending" limit={4} />
      <ProductRecommendations type="new-arrivals" limit={4} />
    </div>
  );
}
