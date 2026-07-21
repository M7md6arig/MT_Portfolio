import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color like #e0b15c");

export const updateSettingsSchema = z.object({
  primaryColor: hexColor.optional(),
  secondaryColor: hexColor.optional(),
  accentColor: hexColor.optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
