import { Router } from "express";
import { listHeroCards, updateHeroCard, uploadHeroCardImage } from "../controllers/hero.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { imageUpload } from "../middlewares/upload";

export const heroRouter = Router();

heroRouter.get("/", listHeroCards);
heroRouter.patch("/:id", requireAuth, updateHeroCard);
heroRouter.post("/:id/image", requireAuth, imageUpload.single("image"), uploadHeroCardImage);
