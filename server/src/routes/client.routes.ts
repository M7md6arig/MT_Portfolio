import { Router } from "express";
import {
  createClient,
  deleteClient,
  listClients,
  updateClient,
  uploadClientBackground,
  uploadClientLogo,
} from "../controllers/client.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { imageUpload } from "../middlewares/upload";

export const clientRouter = Router();

clientRouter.get("/", listClients);
clientRouter.post("/", requireAuth, createClient);
clientRouter.patch("/:id", requireAuth, updateClient);
clientRouter.delete("/:id", requireAuth, deleteClient);

clientRouter.post("/:id/logo", requireAuth, imageUpload.single("image"), uploadClientLogo);
clientRouter.post("/:id/background", requireAuth, imageUpload.single("image"), uploadClientBackground);
