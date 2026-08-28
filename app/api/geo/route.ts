import { NextRequest, NextResponse } from "next/server";
import { COUNTRY_TO_CURRENCY_MAP, DEFAULT_CURRENCY } from "@/src/lib/currency";

export async function GET(request: NextRequest) {
  // Check Vercel Geo headers, Cloudflare headers, or x-forwarded headers
  const countryHeader =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    "";

  const country = countryHeader.toUpperCase().trim();
  const currency = COUNTRY_TO_CURRENCY_MAP[country] || DEFAULT_CURRENCY;

  return NextResponse.json({
    success: true,
    country: country || null,
    currency,
  });
}
