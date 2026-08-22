import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// Helper to access D1 database in Cloudflare Workers / Miniflare environment
export function getDb(d1?: D1Database) {
  // 1. If passed directly (e.g. from worker fetch context / route handler)
  if (d1) {
    return drizzle(d1, { schema });
  }

  // 2. Try global cloudflare env or globalThis.process.env
  try {
    // Dynamic import / global check for Cloudflare Workers environment
    // @ts-expect-error - cloudflare env global
    const cfEnv = typeof env !== "undefined" ? env : (globalThis as unknown as { env?: { DB?: D1Database } })?.env;
    if (cfEnv?.DB) {
      return drizzle(cfEnv.DB, { schema });
    }
  } catch {
    // pass through
  }

  return null;
}
