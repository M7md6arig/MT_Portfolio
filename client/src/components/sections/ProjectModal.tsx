import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { LazyImage } from "@/components/common/LazyImage";
import { Modal } from "@/components/common/Modal";
import { Tag } from "@/components/common/Tag";
import { CATEGORY_GRADIENTS, CATEGORY_LABELS } from "@/data/constants";
import type { Project } from "@/types";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

/** Project detail dialog. Videos show a thumbnail first and only load the player on demand. */
export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setPlaying(false);
  }, [project?.id]);

  const isPlayable =
    project !== null &&
    (project.category === "video" || project.category === "motion") &&
    Boolean(project.mediaUrl);

  return (
    <Modal open={project !== null} onClose={onClose} label={project?.title ?? "Project details"}>
      {project && (
        <div>
          <div className="relative">
            {isPlayable && playing ? (
              <video
                src={project.mediaUrl ?? undefined}
                controls
                autoPlay
                className="aspect-video w-full bg-black"
              />
            ) : (
              <>
                <LazyImage
                  src={project.thumbnailUrl || null}
                  alt={project.title}
                  className="aspect-video w-full"
                  fallbackClassName={CATEGORY_GRADIENTS[project.category]}
                />
                {isPlayable && (
                  <button
                    onClick={() => setPlaying(true)}
                    aria-label={`Play ${project.title}`}
                    className="absolute inset-0 grid place-items-center bg-black/30 transition-colors duration-300 hover:bg-black/15"
                  >
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-accent text-night shadow-glow transition-transform duration-300 hover:scale-110">
                      <svg width="20" height="22" viewBox="0 0 20 22" fill="currentColor" aria-hidden="true">
                        <path d="M2 1.5v19l16-9.5L2 1.5z" />
                      </svg>
                    </span>
                  </button>
                )}
              </>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <span className="text-xs uppercase tracking-[0.25em] text-accent">
              {CATEGORY_LABELS[project.category]}
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold">{project.title}</h3>
            <p className="mt-4 leading-relaxed text-neutral-400">{project.description}</p>

            {project.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}

            {project.liveUrl && (
              <div className="mt-8">
                <Button href={project.liveUrl} external>
                  View live
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
