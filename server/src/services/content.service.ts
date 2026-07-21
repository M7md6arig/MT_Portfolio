import { prisma } from "../config/prisma";

export function listServices() {
  return prisma.service.findMany({ orderBy: { order: "asc" } });
}

export function listSocialLinks() {
  return prisma.socialLink.findMany({ orderBy: { order: "asc" } });
}
