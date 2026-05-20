import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
export const dynamic = "force-dynamic";

import { ProductsPage } from "@/components/product/products-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Products",
  description: "Browse thousands of authentic homemade products from local vendors.",
};

export default function Products() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ProductsPage />
      </main>
      <Footer />
    </div>
  );
}
