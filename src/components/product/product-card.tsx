"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: string[];
    rating: number;
    reviewCount: number;
    isOrganic: boolean;
    isFeatured: boolean;
    stock: number;
    vendor: {
      id: string;
      storeName: string;
      slug: string;
    };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession();
  const addItem = useCartStore((s) => s.addItem);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!session) {
      toast.error("Please login to add items to cart");
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/placeholder.png",
      quantity: 1,
      vendorId: product.vendor.id,
      vendorName: product.vendor.storeName,
      stock: product.stock,
    });
    toast.success("Added to cart!");
  };

  const handleWishlist = async () => {
    if (!session) {
      toast.error("Please login to add to wishlist");
      return;
    }
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.ok) toast.success("Added to wishlist!");
      else toast.error("Already in wishlist");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/products/${product.slug}`}>
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <Badge variant="destructive">{discount}% OFF</Badge>
          )}
          {product.isOrganic && <Badge variant="success">Organic</Badge>}
          {product.isFeatured && <Badge>Featured</Badge>}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition opacity-0 group-hover:opacity-100"
        >
          <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/vendor/${product.vendor.slug}`} className="text-xs text-orange-600 hover:underline">
          {product.vendor.storeName}
        </Link>
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-1 text-sm font-medium text-gray-900 line-clamp-2 hover:text-orange-600 transition">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mt-2 space-x-1">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-gray-600">
            {product.rating.toFixed(1)} ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center mt-2 space-x-2">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.comparePrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <Button
          onClick={handleAddToCart}
          className="w-full mt-3"
          size="sm"
          disabled={product.stock === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
