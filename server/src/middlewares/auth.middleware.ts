import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { getAccessTokenCookie } from "../utils/cookies";
import { HttpError } from "./errorHandler";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: string;
  tokenVersion: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = getAccessTokenCookie(req.cookies);

  if (!token) {
    next(new HttpError(401, "Authentication required"));
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as unknown as AuthTokenPayload;

    // Reject tokens issued before the last password change / manual reset,
    // even if they haven't naturally expired yet.
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { tokenVersion: true },
    });
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      next(new HttpError(401, "Session invalidated — please sign in again"));
      return;
    }

    req.user = payload;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
}
