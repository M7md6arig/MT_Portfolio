import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { CreateClientInput, UpdateClientInput } from "../validators/client.validator";
import { uploadToCloudinary } from "./image.service";

const LOGO_FOLDER = "mt-portfolio/clients/logos";
const BACKGROUND_FOLDER = "mt-portfolio/clients/backgrounds";

export async function listClients() {
  try {
    return await prisma.client.findMany({ orderBy: { order: "asc" } });
  } catch (err) {
    // P2021: table missing until the migration is deployed — the public site
    // falls back to placeholder data instead of erroring.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021") {
      return [];
    }
    throw err;
  }
}

export function getClientById(id: string) {
  return prisma.client.findUnique({ where: { id } });
}

export function createClient(data: CreateClientInput) {
  return prisma.client.create({ data });
}

export function updateClient(id: string, data: UpdateClientInput) {
  return prisma.client.update({ where: { id }, data });
}

export function deleteClient(id: string) {
  return prisma.client.delete({ where: { id } });
}

/** Uploads a new logo and replaces the stored URL (old asset stays in Cloudinary). */
export async function uploadClientLogo(id: string, buffer: Buffer) {
  const uploaded = await uploadToCloudinary(buffer, LOGO_FOLDER);
  return prisma.client.update({ where: { id }, data: { logoUrl: uploaded.secure_url } });
}

export async function uploadClientBackground(id: string, buffer: Buffer) {
  const uploaded = await uploadToCloudinary(buffer, BACKGROUND_FOLDER);
  return prisma.client.update({ where: { id }, data: { backgroundUrl: uploaded.secure_url } });
}
