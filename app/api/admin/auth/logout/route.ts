/**
 * app/api/admin/auth/logout/route.ts
 * POST /api/admin/auth/logout — clears the session cookie.
 */

import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response.cookies);
  return response;
}
