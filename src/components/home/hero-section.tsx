import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>India&apos;s #1 Homemade Products Marketplace</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Discover{" "}
            <span className="text-orange-600">Authentic Homemade</span>{" "}
            Products
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-2xl">
            From kitchen-fresh food to handcrafted art — buy directly from local artisans
            and home entrepreneurs. Fresh, organic, and made with love.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/products">
              <Button size="lg" className="text-base px-8">
                Explore Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/vendor/register">
              <Button variant="outline" size="lg" className="text-base px-8">
                Start Selling
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex items-center space-x-8 text-sm text-gray-500">
            <div>
              <span className="text-2xl font-bold text-gray-900">10K+</span>
              <p>Products</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">2K+</span>
              <p>Vendors</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">50K+</span>
              <p>Happy Customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
      <div className="absolute bottom-20 right-40 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
    </section>
  );
}
