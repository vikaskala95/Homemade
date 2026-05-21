import Link from "next/link";
import type { Metadata } from "next";
import { Heart, Leaf, Shield, Star, Users, Store } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in or create an account on Homemade Everything",
};

const features = [
  { icon: Heart, text: "Handcrafted with love by local artisans" },
  { icon: Leaf, text: "100% organic & natural ingredients" },
  { icon: Shield, text: "Verified sellers & quality assured" },
  { icon: Users, text: "Join 10,000+ happy customers" },
];

const stats = [
  { value: "2,500+", label: "Artisans" },
  { value: "15,000+", label: "Products" },
  { value: "50+", label: "Cities" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col justify-between relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700">
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grain" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="1.5" fill="white" />
                <circle cx="10" cy="10" r="1" fill="white" />
                <circle cx="50" cy="50" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grain)" />
          </svg>
        </div>

        {/* Top — Logo */}
        <div className="relative z-10 px-10 pt-10">
          <Link href="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Homemade<span className="text-amber-200">Everything</span>
            </span>
          </Link>
        </div>

        {/* Center — Hero content */}
        <div className="relative z-10 px-10 space-y-8">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              India&apos;s Favourite
              <br />
              <span className="text-amber-200">Homemade</span> Marketplace
            </h1>
            <p className="mt-3 text-orange-100 text-base leading-relaxed max-w-sm">
              Discover authentic homemade food, crafts, organic products &amp; more from verified local artisans across India.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-3.5">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <f.icon className="h-4 w-4 text-amber-200" />
                </div>
                <span className="text-white/90 text-sm">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-8 pt-2">
            {stats.map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-orange-200 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — Testimonial */}
        <div className="relative z-10 px-10 pb-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              ))}
            </div>
            <p className="text-white/90 text-sm italic leading-relaxed">
              &ldquo;Found the most amazing homemade pickles and snacks! The quality is unmatched. Love supporting local artisans.&rdquo;
            </p>
            <p className="text-amber-200 text-xs font-medium mt-3">— Priya S., Mumbai</p>
          </div>
        </div>
      </div>

      {/* Right content panel */}
      <div className="flex-1 flex flex-col min-h-screen bg-white dark:bg-gray-950">
        {/* Mobile logo bar */}
        <header className="lg:hidden w-full px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Homemade<span className="text-orange-600">Everything</span>
            </span>
          </Link>
        </header>

        {/* Form area */}
        <main className="flex-1 flex items-center justify-center px-5 py-8 sm:px-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full px-6 py-4 text-center text-xs text-gray-400 dark:text-gray-600 border-t border-gray-50 dark:border-gray-900">
          &copy; {new Date().getFullYear()} Homemade Everything. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
