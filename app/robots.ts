import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/",
          "/api/*",
          "/checkout",
          "/checkout/*",
          "/payment",
          "/payment/*",
        ],
      },
    ],
    sitemap: "https://sialkotcricketkits.com/sitemap.xml",
    host: "https://sialkotcricketkits.com",
  };
}
