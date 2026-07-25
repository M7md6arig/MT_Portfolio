import type { Project } from "@/types";
import { cloudinaryUrl, videoThumbnailUrl } from "@/utils/cloudinary";

/**
 * The image the public site shows for a project: first gallery image, else a
 * real frame pulled from the project's video (when it has one), else the
 * stored thumbnail. `width` requests an optimized Cloudinary delivery sized
 * for where it's displayed, instead of the full original file.
 */
export function coverUrl(project: Project, width?: number): string | null {
  const galleryImage = project.images?.[0]?.url;
  if (galleryImage) return width ? cloudinaryUrl(galleryImage, width) : galleryImage;

  const fromVideo = project.mediaUrl ? videoThumbnailUrl(project.mediaUrl, width) : null;
  if (fromVideo) return fromVideo;

  return project.thumbnailUrl || null;
}
