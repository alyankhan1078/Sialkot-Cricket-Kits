import type { MetadataRoute } from "next";

const origin = "https://sialkot-cricket-kits.pages.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  // Static routes only — product routes will be dynamic from DB
  // /payment is intentionally excluded (noindex sensitive page)
  // /admin is intentionally excluded
  const routes = ["", "/shop", "/custom-bat", "/about", "/contact", "/faq"].map((path) => ({
    url: `${origin}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  return routes;
}
