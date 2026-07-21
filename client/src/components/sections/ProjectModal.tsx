import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { LazyImage } from "@/components/common/LazyImage";
import { Modal } from "@/components/common/Modal";
import { Tag } from "@/components/common/Tag";
import { CATEGORY_GRADIENTS, CATEGORY_LABELS } from "@/data/constants";
import type { Project } from "@/types";
import { cn } from "@/utils/cn";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

/** Project detail dialog. Videos show a thumbnail first and only load the player on demand. */
export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [playing, setPlaying] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setPlaying(false);
    setActiveImage(0);
  }, [project?.id]);

  const isPlayable =
    project !== null &&
    (project.category === "video" || project.category === "motion") &&
    Boolean(project.mediaUrl);

  const gallery = project?.images ?? [];
  const mainImage = gallery[activeImage]?.url ?? project?.thumbnailUrl ?? null;

  function navigate(delta: number) {
    if (gallery.length < 2) return;
    setActiveImage((i) => (i + delta + gallery.length) % gallery.length);
    setPlaying(false);
  }

  // Arrow-key navigation while the dialog is open (Escape is handled by Modal itself).
  useEffect(() => {
    if (!project || gallery.length < 2) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") navigate(1);
      if (event.key === "ArrowLeft") navigate(-1);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, gallery.length]);

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
                {/* night backdrop letterboxes portrait/landscape images shown uncropped */}
                <div className="bg-night">
                  <LazyImage
                    key={mainImage ?? "fallback"}
                    src={mainImage}
                    alt={project.title}
                    fit="contain"
                    className="aspect-video w-full"
                    fallbackClassName={CATEGORY_GRADIENTS[project.category]}
                  />
                </div>

                {gallery.length > 1 && (
                  <>
                    <button
                      onClick={() => navigate(-1)}
                      aria-label="Previous image"
                      className="glass absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-white transition-colors hover:text-accent"
                    >
                      <svg width="9" height="16" viewBox="0 0 9 16" fill="none" aria-hidden="true">
                        <path d="M8 1L1 8l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      onClick={() => navigate(1)}
                      aria-label="Next image"
                      className="glass absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-white transition-colors hover:text-accent"
                    >
                      <svg width="9" height="16" viewBox="0 0 9 16" fill="none" aria-hidden="true">
                        <path d="M1 1l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <span className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-xs text-neutral-300">
                      {activeImage + 1} / {gallery.length}
                    </span>
                  </>
                )}

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

          {/* gallery strip — only when the project has more than one image */}
          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto border-b border-line px-6 py-3 sm:px-8">
              {gallery.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => {
                    setActiveImage(index);
                    setPlaying(false);
                  }}
                  aria-label={`Image ${index + 1} of ${gallery.length}`}
                  aria-current={index === activeImage}
                  className={cn(
                    "h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition-colors",
                    index === activeImage
                      ? "border-accent"
                      : "border-line opacity-60 hover:opacity-100",
                  )}
                >
                  <img src={image.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

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
