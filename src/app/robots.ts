import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://homemadeeverything.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/vendor/dashboard",
          "/vendor/products",
          "/vendor/orders",
          "/vendor/settings",
          "/dashboard/",
          "/checkout",
          "/cart",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
