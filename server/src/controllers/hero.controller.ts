import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { HttpError } from "../middlewares/errorHandler";
import * as heroService from "../services/hero.service";
import { heroSlotIdSchema, updateHeroCardSchema } from "../validators/hero.validator";

export const listHeroCards = asyncHandler(async (_req: Request, res: Response) => {
  const cards = await heroService.listHeroCards();
  res.json({ data: cards });
});

export const updateHeroCard = asyncHandler(async (req: Request, res: Response) => {
  const id = heroSlotIdSchema.parse(req.params.id);
  const input = updateHeroCardSchema.parse(req.body);
  const card = await heroService.updateHeroCard(id, input);
  res.json({ data: card });
});

export const uploadHeroCardImage = asyncHandler(async (req: Request, res: Response) => {
  const id = heroSlotIdSchema.parse(req.params.id);
  if (!req.file) {
    throw new HttpError(400, 'Missing image file (multipart field "image")');
  }
  const card = await heroService.uploadHeroCardImage(id, req.file.buffer);
  res.status(201).json({ data: card });
});
