import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { loginLimiter } from "../middlewares/rateLimit";

export const authRouter = Router();

authRouter.post("/login", loginLimiter, login);
