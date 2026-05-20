import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { generateProductJsonLd, generateBreadcrumbJsonLd } from "@/lib/structured-data";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    select: { name: true, shortDesc: true, metaTitle: true, metaDesc: true, images: true },
  });

  if (!product) return { title: "Product Not Found" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://homemadeeverything.com";

  return {
    title: product.metaTitle || product.name,
    description: product.metaDesc || product.shortDesc || `Buy ${product.name} on Homemade Everything`,
    alternates: {
      canonical: `/products/${params.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.shortDesc || "",
      type: "website",
      url: `${baseUrl}/products/${params.slug}`,
      images: product.images[0] ? [{ url: product.images[0], width: 800, height: 800, alt: product.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDesc || "",
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await db.product.findUnique({
    where: { slug: params.slug, status: "ACTIVE" },
    include: {
      vendor: {
        select: {
          id: true,
          storeName: true,
          slug: true,
          logo: true,
          rating: true,
          totalSales: true,
        },
      },
      category: { select: { id: true, name: true, slug: true } },
      reviews: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!product) notFound();

  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "ACTIVE",
    },
    include: {
      vendor: { select: { id: true, storeName: true, slug: true } },
    },
    take: 4,
  });

  // Increment view count
  await db.product.update({
    where: { id: product.id },
    data: { viewCount: { increment: 1 } },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://homemadeeverything.com";
  const productJsonLd = generateProductJsonLd(product);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: product.category?.name || "Products", url: `${baseUrl}/products?category=${product.category?.slug || ""}` },
    { name: product.name, url: `${baseUrl}/products/${product.slug}` },
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="flex-1">
        <ProductDetail product={product} relatedProducts={relatedProducts} />
      </main>
      <Footer />
    </div>
  );
}
