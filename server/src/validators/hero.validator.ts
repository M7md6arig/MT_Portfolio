import { z } from "zod";

/** Slot ids are fixed by the client layout constants (hc-1 … hc-8). */
export const heroSlotIdSchema = z.string().regex(/^hc-\d{1,2}$/, "Unknown hero card slot");

export const updateHeroCardSchema = z.object({
  // null clears the override so the default title from constants shows again
  title: z.string().min(1).max(80).nullish(),
  // true removes the custom image so the slot falls back to its project cover
  clearImage: z.boolean().optional(),
});

export type UpdateHeroCardInput = z.infer<typeof updateHeroCardSchema>;
