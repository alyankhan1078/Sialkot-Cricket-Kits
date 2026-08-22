import { NextRequest } from "next/server";
import { validateAdminSession } from "./data-service";

export function isAuthenticatedAdmin(request: NextRequest | Request): boolean {
  if ("cookies" in request && typeof request.cookies?.get === "function") {
    const token = (request as NextRequest).cookies.get("sck_admin_token")?.value;
    return validateAdminSession(token);
  }

  // Generic Request header parsing
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/sck_admin_token=([^;]+)/);
  const token = match ? match[1] : undefined;
  return validateAdminSession(token);
}

export function validateAdminSessionFromRequest(request: Request): boolean {
  return isAuthenticatedAdmin(request);
}
