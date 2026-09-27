/**
 * prisma/seed-admin.ts
 * One-time seed script to create the single admin user.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword npx tsx prisma/seed-admin.ts
 *
 * Or add to package.json:
 *   "seed:admin": "tsx prisma/seed-admin.ts"
 * Then run: npm run seed:admin
 *
 * The script is IDEMPOTENT — running it again with the same email updates the password.
 * This is intentionally a single-user system. Do NOT build multi-user roles here.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌  Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running this script.");
    process.exit(1);
  }

  if (password.length < 12) {
    console.error("❌  ADMIN_PASSWORD must be at least 12 characters for security.");
    process.exit(1);
  }

  console.log(`→  Hashing password for ${email} …`);
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
    },
  });

  console.log(`✅  Admin user ready: id=${admin.id}, email=${admin.email}`);
}

main()
  .catch((err) => {
    console.error("❌  Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
