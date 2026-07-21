import { Router } from "express";
import {
  createService,
  createSocialLink,
  deleteService,
  deleteSocialLink,
  getServices,
  getSocialLinks,
  updateService,
  updateSocialLink,
} from "../controllers/content.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const contentRouter = Router();

contentRouter.get("/services", getServices);
contentRouter.post("/services", requireAuth, createService);
contentRouter.patch("/services/:id", requireAuth, updateService);
contentRouter.delete("/services/:id", requireAuth, deleteService);

contentRouter.get("/social-links", getSocialLinks);
contentRouter.post("/social-links", requireAuth, createSocialLink);
contentRouter.patch("/social-links/:id", requireAuth, updateSocialLink);
contentRouter.delete("/social-links/:id", requireAuth, deleteSocialLink);
