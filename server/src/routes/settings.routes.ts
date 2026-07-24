import { Router } from "express";
import { getSettings, updateSettings, uploadSiteLogo } from "../controllers/settings.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { imageUpload } from "../middlewares/upload";

export const settingsRouter = Router();

settingsRouter.get("/", getSettings);
settingsRouter.patch("/", requireAuth, updateSettings);
settingsRouter.post("/logo", requireAuth, imageUpload.single("image"), uploadSiteLogo);
