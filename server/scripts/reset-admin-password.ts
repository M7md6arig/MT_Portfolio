/**
 * Generates a strong random password for the admin account, hashes it, and
 * updates the User row in place. The plaintext password is printed to the
 * console exactly once — copy it into a password manager immediately. It is
 * never written to a file, logged elsewhere, or stored anywhere but the hash.
 *
 * Usage: npx tsx scripts/reset-admin-password.ts [email]
 * (defaults to ADMIN_EMAIL from .env if no argument is given)
 */
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "../src/config/prisma";

const BCRYPT_ROUNDS = 12;

function generateStrongPassword(): string {
  // 24 chars from a mixed alphabet (no ambiguous-looking symbols), via
  // rejection sampling on random bytes so the distribution stays uniform.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const bytes = crypto.randomBytes(64);
  let out = "";
  for (const b of bytes) {
    if (out.length === 24) break;
    if (b < 256 - (256 % alphabet.length)) out += alphabet[b % alphabet.length];
  }
  return out;
}

async function main() {
  const email = process.argv[2] ?? process.env.ADMIN_EMAIL;
  if (!email) {
    throw new Error("Pass an email as an argument, or set ADMIN_EMAIL in the environment.");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`No user found with email ${email}`);
  }

  const password = generateStrongPassword();
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      // Reset lockout state and bump tokenVersion so every existing session
      // (if the security-hardening migration has been applied) is invalidated.
      failedLoginAttempts: 0,
      lockedUntil: null,
      tokenVersion: { increment: 1 },
    },
  });

  console.log("\n=================================================");
  console.log(`Admin password reset for: ${email}`);
  console.log(`New password (shown once — save it now): ${password}`);
  console.log("=================================================\n");
}

main()
  .catch((err) => {
    console.error(err.message ?? err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
