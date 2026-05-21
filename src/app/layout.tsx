import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PWARegister } from "@/components/pwa-register";
import { generateOrganizationJsonLd, generateWebsiteJsonLd } from "@/lib/structured-data";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Homemade Everything",
  },
  title: {
    default: "Homemade Everything - Buy & Sell Homemade Products",
    template: "%s | Homemade Everything",
  },
  description:
    "Discover authentic homemade food, snacks, bakery items, handmade crafts, organic products, and more from local vendors.",
  keywords: [
    "homemade",
    "handmade",
    "organic",
    "local vendors",
    "homemade food",
    "crafts",
    "marketplace",
    "buy homemade",
    "sell homemade",
    "artisan",
    "natural products",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://homemadeeverything.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Homemade Everything - Buy & Sell Homemade Products",
    description: "India's premier marketplace for authentic homemade food, crafts, organic products from local vendors.",
    type: "website",
    locale: "en_IN",
    siteName: "Homemade Everything",
    url: "/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Homemade Everything Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Homemade Everything",
    description: "Buy & Sell Homemade Products from local vendors across India",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebsiteJsonLd()) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <PWARegister />
      </body>
    </html>
  );
}
