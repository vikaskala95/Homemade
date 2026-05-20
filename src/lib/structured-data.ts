export function generateProductJsonLd(product: {
  name: string;
  description: string;
  images: string[];
  price: number;
  comparePrice?: number | null;
  slug: string;
  rating: number;
  reviewCount: number;
  vendor?: { storeName: string } | null;
  stock: number;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://homemadeeverything.com";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    url: `${baseUrl}/products/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: product.vendor?.storeName || "Homemade Everything",
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability: product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: product.vendor?.storeName || "Homemade Everything",
      },
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };
}

export function generateOrganizationJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://homemadeeverything.com";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Homemade Everything",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: "India's premier marketplace for authentic homemade products",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@homemadeeverything.com",
    },
  };
}

export function generateWebsiteJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://homemadeeverything.com";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Homemade Everything",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
