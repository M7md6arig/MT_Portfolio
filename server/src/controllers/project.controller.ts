import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { HttpError } from "../middlewares/errorHandler";
import * as imageService from "../services/image.service";
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

export const uploadProjectImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new HttpError(400, 'Missing image file (multipart field "image")');
  }
  const project = await projectService.getProjectById(req.params.id);
  if (!project) {
    throw new HttpError(404, "Project not found");
  }
  const image = await imageService.addProjectImage(req.params.id, req.file.buffer);
  res.status(201).json({ data: image });
});

export const deleteProjectImage = asyncHandler(async (req: Request, res: Response) => {
  const { count } = await imageService.deleteProjectImage(req.params.projectId, req.params.imageId);
  if (count === 0) {
    throw new HttpError(404, "Image not found");
  }
  res.status(204).send();
});
