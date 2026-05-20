export const dynamic = "force-dynamic";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { BecomeVendor } from "@/components/home/become-vendor";
import { TrendingAndNewArrivals } from "@/components/home/trending-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Homemade Everything - Buy & Sell Homemade Products",
  description:
    "Discover authentic homemade food, snacks, bakery items, handmade crafts, organic products from local vendors across India.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <FeaturedProducts />
        <TrendingAndNewArrivals />
        <WhyChooseUs />
        <BecomeVendor />
      </main>
      <Footer />
    </div>
  );
}
