import { Router } from "express";
import { login, logout, me, refresh } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { loginLimiter } from "../middlewares/rateLimit";

export const authRouter = Router();

authRouter.post("/login", loginLimiter, login);
authRouter.post("/refresh", loginLimiter, refresh);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, me);
