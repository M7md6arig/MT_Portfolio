import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { HttpError } from "../middlewares/errorHandler";

export const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export interface AuthResult {
  token: string;
  user: { id: string; email: string; role: string };
}

export interface LoginContext {
  ip: string;
  userAgent: string;
}

async function recordAttempt(
  email: string,
  userId: string | null,
  success: boolean,
  ctx: LoginContext,
) {
  await prisma.loginAudit.create({
    data: { email, userId, success, ip: ctx.ip, userAgent: ctx.userAgent },
  });
}

export async function login(email: string, password: string, ctx: LoginContext): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Same generic error as a wrong password — don't leak which part was wrong.
    await recordAttempt(email, null, false, ctx);
    throw new HttpError(401, "Invalid credentials");
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await recordAttempt(email, user.id, false, ctx);
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new HttpError(
      423,
      `Account temporarily locked. Try again in ${minutesLeft} minute(s). / الحساب مقفل مؤقتًا، حاول بعد ${minutesLeft} دقيقة.`,
    );
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    const attempts = user.failedLoginAttempts + 1;
    const lockedUntil = attempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS) : null;
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: attempts, lockedUntil },
    });
    await recordAttempt(email, user.id, false, ctx);
    throw new HttpError(401, "Invalid credentials");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
  await recordAttempt(email, user.id, true, ctx);

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as jwt.SignOptions,
  );

  return { token, user: { id: user.id, email: user.email, role: user.role } };
}
