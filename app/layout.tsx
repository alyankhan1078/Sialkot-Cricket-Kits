import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "@/src/components/SiteChrome";
import { StoreProvider } from "@/src/components/StoreProvider";

export const metadata: Metadata = {
  title: "Sialkot Cricket Kits | Cricket Bats & Equipment Worldwide",
  description:
    "Shop authentic cricket bats, batting gloves, pads, keeping equipment, kit bags and customized cricket gear from Sialkot Cricket Kits. Worldwide delivery and live product videos available.",
  openGraph: {
    title: "Sialkot Cricket Kits | Cricket Equipment Worldwide",
    description:
      "Cricket bats, protective equipment, kit bags, accessories and custom-bat support from Sialkot, Pakistan.",
    url: "/",
    siteName: "Sialkot Cricket Kits",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Sialkot Cricket Kits - Cricket Equipment and Worldwide Delivery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sialkot Cricket Kits",
    description: "Cricket equipment from Sialkot with worldwide delivery.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/assets/brand/sialkot-cricket-kits-logo.png",
    apple: "/assets/brand/sialkot-cricket-kits-logo.png",
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

function safeJsonLd(obj: Record<string, unknown>): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "SportingGoodsStore",
    name: "Sialkot Cricket Kits",
    url: "https://sialkotcricketkits.com",
    logo: "https://sialkotcricketkits.com/assets/brand/sialkot-cricket-kits-logo.png",
    email: "sialkotcricketkits@gmail.com",
    telephone: "+923231438214",
    address: {
      "@type": "PostalAddress",
      streetAddress: "House No. 207, Gulshan Street, Model Town",
      addressLocality: "Sialkot",
      addressCountry: "PK",
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Rubik:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(organization) }}
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
