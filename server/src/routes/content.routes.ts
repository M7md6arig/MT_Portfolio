import { Router } from "express";
import { getServices, getSocialLinks } from "../controllers/content.controller";

export const contentRouter = Router();

contentRouter.get("/services", getServices);
contentRouter.get("/social-links", getSocialLinks);
