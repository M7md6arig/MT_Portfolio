import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import * as contactService from "../services/contact.service";
import { contactSchema } from "../validators/contact.validator";

export const submitMessage = asyncHandler(async (req: Request, res: Response) => {
  const input = contactSchema.parse(req.body);
  const message = await contactService.createMessage(input);
  res.status(201).json({ data: { id: message.id, received: true } });
});
