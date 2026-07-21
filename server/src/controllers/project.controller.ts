import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { HttpError } from "../middlewares/errorHandler";
import * as projectService from "../services/project.service";
import {
  createProjectSchema,
  listProjectsQuerySchema,
  updateProjectSchema,
} from "../validators/project.validator";

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const { category } = listProjectsQuerySchema.parse(req.query);
  const projects = await projectService.listProjects(category);
  res.json({ data: projects });
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.getProjectById(req.params.id);
  if (!project) {
    throw new HttpError(404, "Project not found");
  }
  res.json({ data: project });
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const input = createProjectSchema.parse(req.body);
  const project = await projectService.createProject(input);
  res.status(201).json({ data: project });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const input = updateProjectSchema.parse(req.body);
  const project = await projectService.updateProject(req.params.id, input);
  res.json({ data: project });
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await projectService.deleteProject(req.params.id);
  res.status(204).send();
});
