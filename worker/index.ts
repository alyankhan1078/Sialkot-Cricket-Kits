/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import sitemap from "../app/sitemap.ts";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. 301 Permanent Redirect: www.sialkotcricketkits.com -> sialkotcricketkits.com
    if (url.hostname === "www.sialkotcricketkits.com") {
      url.hostname = "sialkotcricketkits.com";
      return Response.redirect(url.toString(), 301);
    }

    // 2. Direct Dynamic Robots.txt Endpoint
    if (url.pathname === "/robots.txt") {
      const robotsContent = `User-Agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /api/
Disallow: /api/*
Disallow: /checkout
Disallow: /checkout/*
Disallow: /payment
Disallow: /payment/*

Sitemap: https://sialkotcricketkits.com/sitemap.xml
Host: https://sialkotcricketkits.com
`;
      return new Response(robotsContent, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
        },
      });
    }

    // 3. Direct Dynamic Sitemap.xml Endpoint (Serving all 185+ products & categories)
    if (url.pathname === "/sitemap.xml") {
      const sitemapEntries = await sitemap();
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
  .map(
    (e) => `  <url>
    <loc>${e.url}</loc>
    <lastmod>${e.lastModified instanceof Date ? e.lastModified.toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>${e.changeFrequency || "weekly"}</changefreq>
    <priority>${e.priority || 0.7}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

      return new Response(xml, {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    }

    // 4. Image optimization endpoint
    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    const response = await handler.fetch(request, env, ctx);

    // 3. Staging/Testing Host Protection: Prevent duplicate indexing on *.workers.dev and *.vercel.app
    const isStagingHost =
      url.hostname.endsWith(".workers.dev") ||
      url.hostname.endsWith(".vercel.app") ||
      url.hostname.includes("preview");

    if (isStagingHost) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set("X-Robots-Tag", "noindex, nofollow");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    return response;
  },
};

export default worker;
