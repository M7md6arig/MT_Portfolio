import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { UpdateHeroCardInput } from "../validators/hero.validator";
import { uploadToCloudinary } from "./image.service";

const HERO_FOLDER = "mt-portfolio/hero";

export async function listHeroCards() {
  try {
    return await prisma.heroCard.findMany();
  } catch (err) {
    // P2021: table missing until the migration is deployed — the hero then
    // simply renders its default constants-driven cards.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021") {
      return [];
    }
    throw err;
  }
}

export function updateHeroCard(id: string, data: UpdateHeroCardInput) {
  const update: Record<string, string | number | null> = {};
  if ("title" in data) update.title = data.title ?? null;
  if (data.clearImage) {
    update.imageUrl = null;
    update.imageWidth = null;
    update.imageHeight = null;
  }
  return prisma.heroCard.upsert({
    where: { id },
    update,
    create: { id, title: data.title ?? null },
  });
}

export async function uploadHeroCardImage(id: string, buffer: Buffer) {
  const uploaded = await uploadToCloudinary(buffer, HERO_FOLDER);
  const image = {
    imageUrl: uploaded.secure_url,
    imageWidth: uploaded.width,
    imageHeight: uploaded.height,
  };
  return prisma.heroCard.upsert({
    where: { id },
    update: image,
    create: { id, ...image },
  });
}
