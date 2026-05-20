"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { Shield, CreditCard, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [notes, setNotes] = useState("");

  const total = getTotal();
  const deliveryCharge = total >= 500 ? 0 : 50;
  const tax = Math.round(total * 0.05 * 100) / 100;
  const grandTotal = total + deliveryCharge + tax;

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!shipping.name || !shipping.phone || !shipping.address || !shipping.city || !shipping.state || !shipping.pincode) {
      toast.error("Please fill all shipping details");
      return;
    }

    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load payment gateway");
        return;
      }

      // Create order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingName: shipping.name,
          shippingPhone: shipping.phone,
          shippingAddress: shipping.address,
          shippingCity: shipping.city,
          shippingState: shipping.state,
          shippingPincode: shipping.pincode,
          couponCode: couponCode || undefined,
          notes: notes || undefined,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        toast.error(orderData.error || "Failed to create order");
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Homemade Everything",
        description: `Order #${orderData.order.orderNumber}`,
        order_id: orderData.razorpayOrderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/orders/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              clearCart();
              toast.success("Payment successful! Order confirmed.");
              router.push(`/orders/${verifyData.orderId}`);
            } else {
              toast.error("Payment verification failed");
            }
          } catch {
            toast.error("Payment verification error");
          }
        },
        prefill: {
          name: shipping.name,
          contact: shipping.phone,
        },
        theme: {
          color: "#ea580c",
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={shipping.name}
                        onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={shipping.phone}
                        onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      value={shipping.address}
                      onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shipping.city}
                        onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={shipping.state}
                        onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={shipping.pincode}
                        onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Order Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Coupon */}
              <Card>
                <CardHeader>
                  <CardTitle>Coupon Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <Button variant="outline">Apply</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 line-clamp-1 flex-1">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium ml-2">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery</span>
                      <span className={deliveryCharge === 0 ? "text-green-600" : ""}>
                        {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (5% GST)</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-base font-bold">
                      <span>Total</span>
                      <span>{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Pay {formatPrice(grandTotal)}
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-3">
                    <Shield className="h-4 w-4" />
                    <span>Secured by Razorpay</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
