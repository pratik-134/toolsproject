/**
 * lib/auth.ts
 * Lightweight JWT-based admin session.
 *
 * Auth approach: signed HTTP-only cookie using `jose` (HMAC-SHA256 JWT).
 * Chosen over NextAuth because:
 *  1. next-auth was not installed and this is a single-admin-user system.
 *  2. A custom JWT cookie is ~80 lines vs. full NextAuth plumbing + adapters.
 *  3. jose works in Next.js edge middleware natively (no Node.js-only APIs).
 *
 * Cookie name: admin_session
 * Payload:    { sub: userId, email }
 * Lifetime:   8 hours (configurable via SESSION_MAX_AGE_HOURS)
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";

const COOKIE_NAME = "admin_session";
const MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET env var is not set");
  return new TextEncoder().encode(secret);
}

export interface AdminSession {
  sub: string;
  email: string;
}

/** Sign a JWT and return the cookie string value */
export async function signAdminToken(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

/** Verify the JWT from the cookie. Returns null if invalid/expired. */
export async function verifyAdminToken(
  token: string
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      sub: payload.sub as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

/** Read and verify the admin session from the incoming request cookies.
 *  Returns null if not authenticated. Safe to call in Server Components and Server Actions.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

/** Set the session cookie on a Response (used after successful login). */
export function setSessionCookie(
  responseCookies: ResponseCookies,
  token: string
): void {
  responseCookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

/** Clear the session cookie (used on logout). */
export function clearSessionCookie(responseCookies: ResponseCookies): void {
  responseCookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export { COOKIE_NAME, MAX_AGE_SECONDS };
