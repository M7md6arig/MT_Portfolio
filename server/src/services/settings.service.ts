import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { UpdateSettingsInput } from "../validators/settings.validator";
import { uploadToCloudinary } from "./image.service";

const SETTINGS_ID = "main";
const LOGO_FOLDER = "mt-portfolio/site";

// Mirrors the column defaults in schema.prisma (and the Tailwind palette).
export const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,
  primaryColor: "#0b0b10",
  secondaryColor: "#12141d",
  accentColor: "#e0b15c",
  logoUrl: null as string | null,
} as const;

export async function getSettings() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
    return settings ?? DEFAULT_SETTINGS;
  } catch (err) {
    // P2021: table missing. P2022: column missing (e.g. logoUrl before this
    // migration is deployed). Either way the public site must still render,
    // so fall back to the default palette.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      (err.code === "P2021" || err.code === "P2022")
    ) {
      return DEFAULT_SETTINGS;
    }
    throw err;
  }
}

export function updateSettings(data: UpdateSettingsInput) {
  const { clearLogo, ...rest } = data;
  const update = clearLogo ? { ...rest, logoUrl: null } : rest;
  return prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    update,
    create: { id: SETTINGS_ID, ...rest },
  });
}

export async function uploadSiteLogo(buffer: Buffer) {
  // Same trim treatment as client logos: strip baked-in transparent padding.
  const uploaded = await uploadToCloudinary(buffer, LOGO_FOLDER, {
    transformation: [{ width: 2000, height: 2000, crop: "limit" }, { effect: "trim" }],
  });
  return prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { logoUrl: uploaded.secure_url },
    create: { id: SETTINGS_ID, logoUrl: uploaded.secure_url },
  });
}
