import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdminUser, getAdminResponseHeaders } from "@/src/lib/admin-auth";

export async function GET(request: NextRequest) {
  const adminUser = await getAuthenticatedAdminUser(request);
  const headers = getAdminResponseHeaders();

  if (!adminUser) {
    return NextResponse.json({ authenticated: false }, { status: 200, headers });
  }

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      },
    },
    { status: 200, headers }
  );
}
