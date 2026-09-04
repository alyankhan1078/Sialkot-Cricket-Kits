import type { NextRequest } from "next/server";
import { getAdminSupabase, getSupabaseAuthClient } from "./supabase";

export const AUTHORIZED_ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "alyankhan1078@gmail.com"
).trim().toLowerCase();

export interface AdminUserInfo {
  id: string;
  email: string;
  role: string;
}

/**
 * Extracts the access token from request cookies or Authorization header.
 */
export function extractAuthToken(request: NextRequest | Request): string | null {
  // 1. Check Authorization header
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const bearer = authHeader.substring(7).trim();
    if (bearer) return bearer;
  }

  // 2. Check NextRequest cookie API
  if ("cookies" in request && typeof (request as NextRequest).cookies?.get === "function") {
    const nextReq = request as NextRequest;
    const token =
      nextReq.cookies.get("sb_access_token")?.value ||
      nextReq.cookies.get("sb-access-token")?.value ||
      nextReq.cookies.get("supabase_auth_token")?.value;
    if (token) return token;
  }

  // 3. Fallback: Parse Cookie header string
  const cookieHeader = request.headers.get("cookie") || "";
  const match =
    cookieHeader.match(/sb_access_token=([^;]+)/) ||
    cookieHeader.match(/sb-access-token=([^;]+)/) ||
    cookieHeader.match(/supabase_auth_token=([^;]+)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }

  return null;
}

/**
 * Validates the Supabase user from the request.
 * Requires:
 * 1. Valid non-expired Supabase Auth user via auth.getUser()
 * 2. Authorized Gmail address: alyankhan1078@gmail.com
 * 3. Immutable claim: app_metadata.role === 'admin'
 * 4. User UUID match if ADMIN_USER_ID is configured
 */
export async function getAuthenticatedAdminUser(
  request: NextRequest | Request
): Promise<AdminUserInfo | null> {
  const token = extractAuthToken(request);
  if (!token) return null;

  try {
    const sb = getAdminSupabase() || getSupabaseAuthClient();
    if (!sb) return null;

    const { data, error } = await sb.auth.getUser(token);
    if (error || !data?.user) {
      return null;
    }

    const user = data.user;
    const userEmail = (user.email || "").trim().toLowerCase();
    const userRole = (user.app_metadata?.role || "").trim().toLowerCase();

    // 1. Enforce authorized admin email
    if (userEmail !== AUTHORIZED_ADMIN_EMAIL) {
      return null;
    }

    // 2. Enforce immutable app_metadata role = 'admin'
    if (userRole !== "admin") {
      return null;
    }

    // 3. If ADMIN_USER_ID is explicitly set in env, enforce UUID match
    if (process.env.ADMIN_USER_ID && user.id !== process.env.ADMIN_USER_ID.trim()) {
      return null;
    }

    return {
      id: user.id,
      email: userEmail,
      role: userRole,
    };
  } catch {
    return null;
  }
}

/**
 * Primary asynchronous guard for admin API endpoints.
 */
export async function isAuthenticatedAdmin(request: NextRequest | Request): Promise<boolean> {
  const admin = await getAuthenticatedAdminUser(request);
  return Boolean(admin);
}

/**
 * Alias for legacy route handlers expecting validateAdminSessionFromRequest.
 */
export async function validateAdminSessionFromRequest(
  request: Request | NextRequest
): Promise<boolean> {
  return isAuthenticatedAdmin(request);
}

/**
 * Standard security response headers for all authenticated admin responses.
 */
export function getAdminResponseHeaders(): Record<string, string> {
  return {
    "Cache-Control": "private, no-store, max-age=0, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };
}
