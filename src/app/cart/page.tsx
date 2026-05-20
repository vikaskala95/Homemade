"use client";

import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const total = getTotal();
  const deliveryCharge = total >= 500 ? 0 : 50;
  const tax = Math.round(total * 0.05 * 100) / 100;
  const grandTotal = total + deliveryCharge + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some homemade products to get started!</p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart ({items.length} items)</h1>
            <Button variant="ghost" size="sm" onClick={() => { clearCart(); toast.success("Cart cleared"); }}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.productId}`} className="font-medium text-gray-900 hover:text-orange-600 line-clamp-1">
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">By {item.vendorName}</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{formatPrice(item.price)}</p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1.5 hover:bg-gray-50"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1.5 hover:bg-gray-50"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                        <button
                          onClick={() => { removeItem(item.productId); toast.success("Item removed"); }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className={deliveryCharge === 0 ? "text-green-600 font-medium" : "font-medium"}>
                    {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (5% GST)</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {deliveryCharge > 0 && (
                <p className="text-xs text-green-600 mt-3">
                  Add {formatPrice(500 - total)} more for free delivery!
                </p>
              )}

              <Link href="/checkout" className="block mt-6">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/products" className="block mt-3">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
