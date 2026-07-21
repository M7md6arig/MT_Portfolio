import { Router } from "express";
import { submitMessage } from "../controllers/contact.controller";

export const contactRouter = Router();

contactRouter.post("/", submitMessage);
