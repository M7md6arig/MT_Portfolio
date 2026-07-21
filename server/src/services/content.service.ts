import { prisma } from "../config/prisma";
import {
  CreateServiceInput,
  CreateSocialLinkInput,
  UpdateServiceInput,
  UpdateSocialLinkInput,
} from "../validators/content.validator";

export function listServices() {
  return prisma.service.findMany({ orderBy: { order: "asc" } });
}

export function createService(data: CreateServiceInput) {
  return prisma.service.create({ data });
}

export function updateService(id: string, data: UpdateServiceInput) {
  return prisma.service.update({ where: { id }, data });
}

export function deleteService(id: string) {
  return prisma.service.delete({ where: { id } });
}

export function listSocialLinks() {
  return prisma.socialLink.findMany({ orderBy: { order: "asc" } });
}

export function createSocialLink(data: CreateSocialLinkInput) {
  return prisma.socialLink.create({ data });
}

export function updateSocialLink(id: string, data: UpdateSocialLinkInput) {
  return prisma.socialLink.update({ where: { id }, data });
}

export function deleteSocialLink(id: string) {
  return prisma.socialLink.delete({ where: { id } });
}
