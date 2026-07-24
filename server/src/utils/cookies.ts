import { Response } from "express";
import { env } from "../config/env";

/**
 * Client and API are always served same-origin (Vite proxy in dev, a
 * platform rewrite in production — see client/vercel.json), so SameSite=strict
 * works without breaking cross-origin auth. `secure` is relaxed in dev only
 * because localhost is plain HTTP.
 */
const isProd = env.nodeEnv === "production";

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";

export const ACCESS_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: ACCESS_TOKEN_TTL_MS,
    path: "/",
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_TTL_MS,
    // Only sent back on the refresh/logout calls that actually need it.
    path: "/api/auth",
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { path: "/" });
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}

export function getAccessTokenCookie(cookies: Record<string, string | undefined>): string | undefined {
  return cookies[ACCESS_COOKIE];
}

export function getRefreshTokenCookie(cookies: Record<string, string | undefined>): string | undefined {
  return cookies[REFRESH_COOKIE];
}
