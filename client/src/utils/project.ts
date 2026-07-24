import type { Project } from "@/types";
import { cloudinaryUrl } from "@/utils/cloudinary";

/**
 * The image the public site shows for a project: first gallery image, else
 * the legacy thumbnail. `width` requests an optimized Cloudinary delivery
 * sized for where it's displayed, instead of the full original file.
 */
export function coverUrl(project: Project, width?: number): string | null {
  const url = project.images?.[0]?.url ?? (project.thumbnailUrl || null);
  return url && width ? cloudinaryUrl(url, width) : url;
}
