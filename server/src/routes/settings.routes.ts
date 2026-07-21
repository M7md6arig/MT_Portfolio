import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const settingsRouter = Router();

settingsRouter.get("/", getSettings);
settingsRouter.patch("/", requireAuth, updateSettings);
