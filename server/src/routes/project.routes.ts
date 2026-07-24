import { Router } from "express";
import {
  createProject,
  deleteProject,
  deleteProjectImage,
  deleteProjectVideo,
  getProject,
  listProjects,
  updateProject,
  uploadProjectImage,
  uploadProjectVideo,
} from "../controllers/project.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { imageUpload, videoUpload } from "../middlewares/upload";

export const projectRouter = Router();

projectRouter.get("/", listProjects);
projectRouter.get("/:id", getProject);
projectRouter.post("/", requireAuth, createProject);
projectRouter.put("/:id", requireAuth, updateProject);
projectRouter.delete("/:id", requireAuth, deleteProject);

projectRouter.post("/:id/images", requireAuth, imageUpload.single("image"), uploadProjectImage);
projectRouter.delete("/:projectId/images/:imageId", requireAuth, deleteProjectImage);

projectRouter.post("/:id/video", requireAuth, videoUpload.single("video"), uploadProjectVideo);
projectRouter.delete("/:id/video", requireAuth, deleteProjectVideo);
