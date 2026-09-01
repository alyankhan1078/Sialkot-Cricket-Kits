import type { MetadataRoute } from "next";
import { getProducts, getCategories } from "../src/lib/data-service.ts";

const BASE_URL = "https://sialkotcricketkits.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  // 1. Core High-Priority Public Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/custom-bat`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/policies/international-agreement`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/shipping-policy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/refund-policy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // 2. Dynamic Categories
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCategories();
    categoryEntries = categories
      .filter((c) => c.active)
      .map((cat) => ({
        url: `${BASE_URL}/shop?category=${encodeURIComponent(cat.name)}`,
        lastModified: currentDate,
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));
  } catch (err) {
    console.error("[Sitemap Categories Error]:", err);
  }

  // 3. Dynamic Active Products from Database
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts({ includeInactive: false });
    productEntries = products.map((product) => {
      let lastMod = currentDate;
      if (product.updatedAt) {
        const parsed = new Date(product.updatedAt);
        if (!isNaN(parsed.getTime())) {
          lastMod = parsed;
        }
      }
      return {
        url: `${BASE_URL}/product/${product.id}`,
        lastModified: lastMod,
        changeFrequency: "weekly" as const,
        priority: product.featured ? 0.9 : 0.75,
      };
    });
  } catch (err) {
    console.error("[Sitemap Products Error]:", err);
  }

  return [...staticPages, ...categoryEntries, ...productEntries];
}
