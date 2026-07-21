import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { UpdateSettingsInput } from "../validators/settings.validator";

const SETTINGS_ID = "main";

// Mirrors the column defaults in schema.prisma (and the Tailwind palette).
export const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,
  primaryColor: "#0b0b10",
  secondaryColor: "#12141d",
  accentColor: "#e0b15c",
} as const;

export async function getSettings() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
    return settings ?? DEFAULT_SETTINGS;
  } catch (err) {
    // P2021: the table doesn't exist yet (migration not deployed). The public
    // site must still render, so fall back to the default palette.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021") {
      return DEFAULT_SETTINGS;
    }
    throw err;
  }
}

export function updateSettings(data: UpdateSettingsInput) {
  return prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...data },
  });
}
