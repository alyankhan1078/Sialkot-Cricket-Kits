import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "@/src/components/SiteChrome";
import { StoreProvider } from "@/src/components/StoreProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://sialkotcricketkits.com"),
  title: {
    default: "Sialkot Cricket Kits | World Top-Class Cricket Bats & Gear Worldwide",
    template: "%s | Sialkot Cricket Kits",
  },
  description:
    "Shop authentic handcrafted cricket bats, batting gloves, pads, helmets, kit bags and customized English Willow cricket equipment from Sialkot Cricket Kits. Tracked worldwide delivery and live product ping videos.",
  keywords: [
    "Cricket Bats",
    "English Willow Bats",
    "Sialkot Cricket",
    "Custom Cricket Bats",
    "Batting Pads",
    "Batting Gloves",
    "Cricket Helmets",
    "Cricket Kit Bags",
    "Sialkot Cricket Kits",
    "Worldwide Cricket Delivery",
  ],
  authors: [{ name: "Sialkot Cricket Kits", url: "https://sialkotcricketkits.com" }],
  creator: "Sialkot Cricket Kits",
  publisher: "Sialkot Cricket Kits",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    title: "Sialkot Cricket Kits | Premium Cricket Bats & Equipment",
    description:
      "Handcrafted English Willow cricket bats, protective equipment, kit bags, and custom bat configurations dispatched directly from Sialkot with worldwide delivery.",
    url: "https://sialkotcricketkits.com",
    siteName: "Sialkot Cricket Kits",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Sialkot Cricket Kits - Handcrafted Cricket Equipment Dispatched Worldwide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sialkot Cricket Kits | Premium Cricket Bats & Equipment",
    description: "Handcrafted English Willow cricket equipment from Sialkot with worldwide delivery.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/assets/brand/sialkot-cricket-kits-logo.png", sizes: "1024x1024", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/assets/brand/sialkot-cricket-kits-logo.png", sizes: "1024x1024", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  alternates: {
    canonical: "https://sialkotcricketkits.com",
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
};

function safeJsonLd(obj: Record<string, unknown>): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "SportingGoodsStore",
    "@id": "https://sialkotcricketkits.com/#store",
    name: "Sialkot Cricket Kits",
    url: "https://sialkotcricketkits.com",
    logo: {
      "@type": "ImageObject",
      url: "https://sialkotcricketkits.com/assets/brand/sialkot-cricket-kits-logo.png",
      width: "1024",
      height: "1024",
    },
    image: "https://sialkotcricketkits.com/assets/brand/sialkot-cricket-kits-logo.png",
    description:
      "Manufacturer and international distributor of premium English Willow cricket bats, batting pads, gloves, helmets, and custom cricket gear based in Sialkot, Pakistan.",
    email: "sialkotcricketkits@gmail.com",
    telephone: "+923231438214",
    priceRange: "££",
    address: {
      "@type": "PostalAddress",
      streetAddress: "House No. 207, Gulshan Street, Model Town",
      addressLocality: "Sialkot",
      addressRegion: "Punjab",
      postalCode: "51310",
      addressCountry: "PK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "32.4945",
      longitude: "74.5229",
    },
    sameAs: [
      "https://www.instagram.com/sialkotcricketkits",
      "https://www.facebook.com/share/1PTo3qxPAn/",
      "https://www.tiktok.com/@sialkotcricketkits",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://sialkotcricketkits.com/#website",
    url: "https://sialkotcricketkits.com",
    name: "Sialkot Cricket Kits",
    description: "Premium Cricket Equipment Handcrafted in Sialkot",
    publisher: {
      "@id": "https://sialkotcricketkits.com/#store",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://sialkotcricketkits.com/shop?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="512x512" href="/icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icon-96.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icon-48.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(storeSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteSchema) }}
        />
      </head>
      <body>
        <StoreProvider>
          <SiteChrome>{children}</SiteChrome>
        </StoreProvider>
      </body>
    </html>
  );
}
