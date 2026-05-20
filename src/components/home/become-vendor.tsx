import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, DollarSign } from "lucide-react";

export function BecomeVendor() {
  return (
    <section className="py-16 bg-gradient-to-r from-orange-600 to-amber-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h2 className="text-3xl font-bold">Start Selling Your Homemade Products</h2>
            <p className="mt-4 text-orange-100 text-lg">
              Join thousands of home entrepreneurs who are earning by sharing their passion.
              Set up your store in minutes!
            </p>

            <div className="mt-8 grid grid-cols-3 gap-6">
              <div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
                <p className="mt-2 font-semibold">Low Commission</p>
                <p className="text-sm text-orange-100">Starting at 10%</p>
              </div>
              <div>
                <Users className="h-8 w-8 text-orange-200" />
                <p className="mt-2 font-semibold">Large Audience</p>
                <p className="text-sm text-orange-100">50K+ customers</p>
              </div>
              <div>
                <DollarSign className="h-8 w-8 text-orange-200" />
                <p className="mt-2 font-semibold">Fast Payouts</p>
                <p className="text-sm text-orange-100">Weekly settlement</p>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/vendor/register">
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-orange-50 text-base px-8"
                >
                  Register as Vendor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-white text-xl font-semibold mb-4">What can you sell?</h3>
              <ul className="space-y-3 text-orange-100">
                {[
                  "Homemade Food & Meals",
                  "Snacks & Namkeens",
                  "Bakery & Sweets",
                  "Pickles & Preserves",
                  "Handmade Crafts & Art",
                  "Organic Products",
                  "Handmade Clothing",
                  "Home Services",
                ].map((item) => (
                  <li key={item} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-orange-300 rounded-full" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
