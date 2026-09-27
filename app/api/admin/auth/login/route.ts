/**
 * app/api/admin/auth/login/route.ts
 * POST /api/admin/auth/login
 * Verifies email+password against the User table (role=ADMIN), issues JWT cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signAdminToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });

    if (!admin || !admin.passwordHash) {
      // Constant-time: still run bcrypt to prevent timing attacks
      await bcrypt.compare(password, "$2b$12$invalidhashusedfortiming");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signAdminToken({ sub: admin.id, email: admin.email });

    const response = NextResponse.json({ ok: true });
    setSessionCookie(response.cookies, token);
    return response;
  } catch (err) {
    console.error("[admin/auth/login]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
