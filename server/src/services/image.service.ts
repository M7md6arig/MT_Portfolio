import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../config/cloudinary";
import { prisma } from "../config/prisma";

const UPLOAD_FOLDER = "mt-portfolio/projects";

function uploadToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: UPLOAD_FOLDER, resource_type: "image" },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Cloudinary returned no result"));
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
}

export async function addProjectImage(projectId: string, buffer: Buffer) {
  const uploaded = await uploadToCloudinary(buffer);

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
