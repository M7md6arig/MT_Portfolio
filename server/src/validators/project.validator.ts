import { z } from "zod";

export const categorySchema = z.enum(["poster", "video", "motion", "website"]);

export const listProjectsQuerySchema = z.object({
  category: categorySchema.optional(),
});

export const createProjectSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(10).max(2000),
  category: categorySchema,
  thumbnailUrl: z.string().url(),
  mediaUrl: z.string().url().nullish(),
  liveUrl: z.string().url().nullish(),
  tags: z.array(z.string().min(1).max(40)).max(12).default([]),
  order: z.number().int().min(0).default(0),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
