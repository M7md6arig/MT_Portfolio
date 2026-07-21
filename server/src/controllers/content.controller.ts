import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import * as contentService from "../services/content.service";

export const getServices = asyncHandler(async (_req: Request, res: Response) => {
  const services = await contentService.listServices();
  res.json({ data: services });
});

export const getSocialLinks = asyncHandler(async (_req: Request, res: Response) => {
  const socialLinks = await contentService.listSocialLinks();
  res.json({ data: socialLinks });
});
