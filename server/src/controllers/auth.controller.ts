import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { HttpError } from "../middlewares/errorHandler";
import * as authService from "../services/auth.service";
import { loginSchema } from "../validators/auth.validator";
import { clearAuthCookies, getRefreshTokenCookie, setAuthCookies } from "../utils/cookies";

function loginContext(req: Request): authService.LoginContext {
  return { ip: req.ip ?? "unknown", userAgent: req.headers["user-agent"] ?? "unknown" };
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const { tokens, user } = await authService.login(email, password, loginContext(req));
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  res.json({ data: { user } });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const raw = getRefreshTokenCookie(req.cookies);
  if (!raw) {
    throw new HttpError(401, "No session to refresh");
  }
  const { tokens, user } = await authService.refresh(raw);
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  res.json({ data: { user } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const raw = getRefreshTokenCookie(req.cookies);
  await authService.logout(raw);
  clearAuthCookies(res);
  res.status(204).send();
});

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json({ data: { user: { id: req.user!.sub, email: req.user!.email, role: req.user!.role } } });
});
