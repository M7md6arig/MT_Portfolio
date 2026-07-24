import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../config/cloudinary";
import { prisma } from "../config/prisma";

const UPLOAD_FOLDER = "mt-portfolio/projects";
const VIDEO_FOLDER = "mt-portfolio/projects/videos";

export function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  options?: { transformation?: Record<string, unknown>[]; resourceType?: "image" | "video" },
): Promise<UploadApiResponse> {
  const { resourceType = "image", ...rest } = options ?? {};
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, ...rest },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Cloudinary returned no result"));
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
}

export async function addProjectImage(projectId: string, buffer: Buffer) {
  const uploaded = await uploadToCloudinary(buffer, UPLOAD_FOLDER);

  // New images go to the end of the gallery.
  const last = await prisma.projectImage.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  return prisma.projectImage.create({
    data: {
      projectId,
      url: uploaded.secure_url,
      order: last ? last.order + 1 : 0,
    },
  });
}

export function deleteProjectImage(projectId: string, imageId: string) {
  // deleteMany so a mismatched projectId can't delete another project's image.
  return prisma.projectImage.deleteMany({ where: { id: imageId, projectId } });
}

/** Uploads a project video and stores it as mediaUrl; a new upload replaces the old one. */
export async function uploadProjectVideo(projectId: string, buffer: Buffer) {
  const uploaded = await uploadToCloudinary(buffer, VIDEO_FOLDER, { resourceType: "video" });
  return prisma.project.update({
    where: { id: projectId },
    data: { mediaUrl: uploaded.secure_url },
  });
}

export function deleteProjectVideo(projectId: string) {
  return prisma.project.update({ where: { id: projectId }, data: { mediaUrl: null } });
}
