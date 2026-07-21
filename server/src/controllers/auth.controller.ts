import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import * as authService from "../services/auth.service";
import { loginSchema } from "../validators/auth.validator";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const result = await authService.login(email, password);
  res.json({ data: result });
});
