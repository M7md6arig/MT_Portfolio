import { Category } from "@prisma/client";
import { prisma } from "../config/prisma";
import { CreateProjectInput, UpdateProjectInput } from "../validators/project.validator";

const withImages = { images: { orderBy: { order: "asc" as const } } };

export function listProjects(category?: Category) {
  return prisma.project.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: withImages,
  });
}

export function getProjectById(id: string) {
  return prisma.project.findUnique({ where: { id }, include: withImages });
}

export function createProject(data: CreateProjectInput) {
  return prisma.project.create({ data });
}

export function updateProject(id: string, data: UpdateProjectInput) {
  return prisma.project.update({ where: { id }, data });
}

export function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}
