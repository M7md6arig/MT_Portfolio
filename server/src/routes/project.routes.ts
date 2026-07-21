import { Router } from "express";
import {
  createProject,
  deleteProject,
  deleteProjectImage,
  getProject,
  listProjects,
  updateProject,
  uploadProjectImage,
} from "../controllers/project.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { imageUpload } from "../middlewares/upload";

export const projectRouter = Router();

projectRouter.get("/", listProjects);
projectRouter.get("/:id", getProject);
projectRouter.post("/", requireAuth, createProject);
projectRouter.put("/:id", requireAuth, updateProject);
projectRouter.delete("/:id", requireAuth, deleteProject);

projectRouter.post("/:id/images", requireAuth, imageUpload.single("image"), uploadProjectImage);
projectRouter.delete("/:projectId/images/:imageId", requireAuth, deleteProjectImage);
