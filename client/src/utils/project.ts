import type { Project } from "@/types";

/** The image the public site shows for a project: first gallery image, else the legacy thumbnail. */
export function coverUrl(project: Project): string | null {
  return project.images?.[0]?.url ?? (project.thumbnailUrl || null);
}
