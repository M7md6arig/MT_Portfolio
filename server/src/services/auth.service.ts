import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { HttpError } from "../middlewares/errorHandler";
import { REFRESH_TOKEN_TTL_MS } from "../utils/cookies";

export const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const ACCESS_TOKEN_EXPIRES_IN = "30m";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface LoginContext {
  ip: string;
  userAgent: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function signAccessToken(user: { id: string; email: string; role: string; tokenVersion: number }): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion },
    env.jwtSecret,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
  );
}

async function issueTokenPair(user: {
  id: string;
  email: string;
  role: string;
  tokenVersion: number;
}): Promise<TokenPair> {
  const accessToken = signAccessToken(user);

  const rawRefreshToken = crypto.randomBytes(40).toString("hex");
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawRefreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return { accessToken, refreshToken: rawRefreshToken };
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

export async function login(
  email: string,
  password: string,
  ctx: LoginContext,
): Promise<{ tokens: TokenPair; user: AuthUser }> {
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

  const tokens = await issueTokenPair(user);
  return { tokens, user: { id: user.id, email: user.email, role: user.role } };
}

/** Verifies the refresh token, revokes it, and issues a fresh pair (rotation on every use). */
export async function refresh(rawRefreshToken: string): Promise<{ tokens: TokenPair; user: AuthUser }> {
  const tokenHash = hashToken(rawRefreshToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new HttpError(401, "Invalid or expired session");
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await issueTokenPair(stored.user);
  return {
    tokens,
    user: { id: stored.user.id, email: stored.user.email, role: stored.user.role },
  };
}

export async function logout(rawRefreshToken: string | undefined): Promise<void> {
  if (!rawRefreshToken) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(rawRefreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** Invalidates every existing access/refresh token for a user (password change, manual reset). */
export async function invalidateAllSessions(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { tokenVersion: { increment: 1 } } }),
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}
