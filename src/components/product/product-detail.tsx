"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "./product-card";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import {
  Star,
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  Store,
} from "lucide-react";
import toast from "react-hot-toast";

interface ProductDetailProps {
  product: any;
  relatedProducts: any[];
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const { data: session } = useSession();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

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
      quantity,
      vendorId: product.vendor.id,
      vendorName: product.vendor.storeName,
      stock: product.stock,
    });
    toast.success("Added to cart!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-orange-600">Products</Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-orange-600">
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            {discount > 0 && (
              <Badge variant="destructive" className="absolute top-4 left-4 text-sm">
                {discount}% OFF
              </Badge>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                    selectedImage === i ? "border-orange-600" : "border-gray-200"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.isOrganic && <Badge variant="success">Organic</Badge>}
              {product.isFeatured && <Badge>Featured</Badge>}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{product.name}</h1>
            <Link
              href={`/vendor/${product.vendor.slug}`}
              className="text-sm text-orange-600 hover:underline mt-1 inline-flex items-center gap-1"
            >
              <Store className="h-3.5 w-3.5" />
              {product.vendor.storeName}
            </Link>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </span>
            <span className="text-sm text-gray-400">|</span>
            <span className="text-sm text-gray-600">{product.soldCount} sold</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
                <Badge variant="destructive">Save {formatPrice(product.comparePrice - product.price)}</Badge>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">{product.shortDesc || product.description}</p>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="p-2 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              onClick={handleAddToCart}
              size="lg"
              className="flex-1"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>

            <Button variant="outline" size="lg" className="px-4">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            {product.stock > 0 ? `${product.stock} items in stock` : "Currently out of stock"}
          </p>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="h-5 w-5 text-green-600" />
              <span>Free delivery above ₹500</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Quality guaranteed</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RotateCcw className="h-5 w-5 text-orange-600" />
              <span>Easy returns</span>
            </div>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {product.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/products?search=${tag}`}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Customer Reviews ({product.reviewCount})
        </h2>

        {product.reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-6">
            {product.reviews.map((review: any) => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-medium text-orange-700">
                    {review.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{review.user.name}</p>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
                {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
