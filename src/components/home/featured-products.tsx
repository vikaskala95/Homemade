import { db } from "@/lib/db";
import { ProductCard } from "@/components/product/product-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export async function FeaturedProducts() {
  const products = await db.product.findMany({
    where: {
      status: "ACTIVE",
      isFeatured: true,
    },
    include: {
      vendor: {
        select: { id: true, storeName: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  if (products.length === 0) {
    // Show placeholder if no products yet
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="mt-2 text-gray-600">
              Handpicked selections from our top vendors
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500">Products coming soon! Be the first vendor to list.</p>
            <Link href="/vendor/register" className="mt-4 inline-block">
              <Button>Become a Vendor</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="mt-2 text-gray-600">
              Handpicked selections from our top vendors
            </p>
          </div>
          <Link href="/products?featured=true">
            <Button variant="outline">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
