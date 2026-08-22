import { NextRequest } from "next/server";
import { validateAdminSession } from "./data-service";

export function isAuthenticatedAdmin(request: NextRequest): boolean {
  const token = request.cookies.get("sck_admin_token")?.value;
  return validateAdminSession(token);
}
