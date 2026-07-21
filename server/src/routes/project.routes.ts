import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from "../controllers/project.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const projectRouter = Router();

projectRouter.get("/", listProjects);
projectRouter.get("/:id", getProject);
projectRouter.post("/", requireAuth, createProject);
projectRouter.put("/:id", requireAuth, updateProject);
projectRouter.delete("/:id", requireAuth, deleteProject);
