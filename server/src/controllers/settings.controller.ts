import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import * as settingsService from "../services/settings.service";
import { updateSettingsSchema } from "../validators/settings.validator";

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await settingsService.getSettings();
  res.json({ data: settings });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const input = updateSettingsSchema.parse(req.body);
  const settings = await settingsService.updateSettings(input);
  res.json({ data: settings });
});
