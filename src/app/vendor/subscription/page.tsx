"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, ArrowLeft, Loader2, Crown } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const plans = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    description: "Get started selling",
    features: [
      "Up to 10 products",
      "Basic analytics",
      "Standard support",
      "10% commission",
    ],
    commission: 10,
  },
  {
    id: "BASIC",
    name: "Basic",
    price: 499,
    description: "For growing vendors",
    features: [
      "Up to 50 products",
      "Advanced analytics",
      "Priority support",
      "8% commission",
      "Featured badge",
      "Coupon creation",
    ],
    commission: 8,
    popular: true,
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: 999,
    description: "For established stores",
    features: [
      "Unlimited products",
      "AI-powered analytics",
      "24/7 dedicated support",
      "5% commission",
      "Featured listings",
      "Priority in search",
      "Marketing tools",
      "Custom store page",
    ],
    commission: 5,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 2499,
    description: "For large businesses",
    features: [
      "Everything in Premium",
      "3% commission",
      "API access",
      "Bulk operations",
      "Account manager",
      "Custom integrations",
      "White-label options",
    ],
    commission: 3,
  },
];

export default function VendorSubscriptionPage() {
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    try {
      const res = await fetch("/api/vendor/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      if (res.ok) {
        toast.success(`Subscribed to ${planId} plan!`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Subscription failed");
      }
    } catch {
      toast.error("Error processing subscription");
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/vendor/dashboard" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Subscription Plans</h1>
        </div>
        <p className="text-gray-500 mb-8 ml-8">Choose a plan that fits your business needs</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? "border-orange-500 border-2 shadow-lg" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-orange-600 text-white px-3"><Star className="h-3 w-3 mr-1 inline" /> Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <p className="text-sm text-gray-500">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹{plan.price}</span>
                  {plan.price > 0 && <span className="text-gray-500">/month</span>}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full ${plan.popular ? "bg-orange-600 hover:bg-orange-700" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribing === plan.id}
                >
                  {subscribing === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : plan.price === 0 ? "Current Plan" : "Subscribe"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
