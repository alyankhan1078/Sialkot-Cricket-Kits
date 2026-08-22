import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/payment", "/admin", "/api/"],
      },
    ],
    sitemap: "https://sialkot-cricket-kits.pages.dev/sitemap.xml",
  };
}
