import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import * as contentService from "../services/content.service";
import {
  createServiceSchema,
  createSocialLinkSchema,
  updateServiceSchema,
  updateSocialLinkSchema,
} from "../validators/content.validator";

export const getServices = asyncHandler(async (_req: Request, res: Response) => {
  const services = await contentService.listServices();
  res.json({ data: services });
});

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const input = createServiceSchema.parse(req.body);
  const service = await contentService.createService(input);
  res.status(201).json({ data: service });
});

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const input = updateServiceSchema.parse(req.body);
  const service = await contentService.updateService(req.params.id, input);
  res.json({ data: service });
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  await contentService.deleteService(req.params.id);
  res.status(204).send();
});

export const getSocialLinks = asyncHandler(async (_req: Request, res: Response) => {
  const socialLinks = await contentService.listSocialLinks();
  res.json({ data: socialLinks });
});

export const createSocialLink = asyncHandler(async (req: Request, res: Response) => {
  const input = createSocialLinkSchema.parse(req.body);
  const socialLink = await contentService.createSocialLink(input);
  res.status(201).json({ data: socialLink });
});

export const updateSocialLink = asyncHandler(async (req: Request, res: Response) => {
  const input = updateSocialLinkSchema.parse(req.body);
  const socialLink = await contentService.updateSocialLink(req.params.id, input);
  res.json({ data: socialLink });
});

export const deleteSocialLink = asyncHandler(async (req: Request, res: Response) => {
  await contentService.deleteSocialLink(req.params.id);
  res.status(204).send();
});
