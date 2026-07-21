import { z } from "zod";

export const createServiceSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(10).max(2000),
  icon: z.string().min(1).max(60),
  order: z.number().int().min(0).default(0),
});

export const updateServiceSchema = createServiceSchema.partial();

export const createSocialLinkSchema = z.object({
  platform: z.string().min(2).max(60),
  url: z.string().url(),
  icon: z.string().min(1).max(60),
  order: z.number().int().min(0).default(0),
});

export const updateSocialLinkSchema = createSocialLinkSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type CreateSocialLinkInput = z.infer<typeof createSocialLinkSchema>;
export type UpdateSocialLinkInput = z.infer<typeof updateSocialLinkSchema>;
