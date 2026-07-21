import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { gridItem, tabContent } from "@/animations/variants";
import { LazyImage } from "@/components/common/LazyImage";
import { Loader } from "@/components/common/Loader";
import { Tag } from "@/components/common/Tag";
import { ProjectModal } from "@/components/sections/ProjectModal";
import { CATEGORY_GRADIENTS, WORK_TABS } from "@/data/constants";
import { fetchProjects } from "@/services/api";
import type { Project, ProjectCategory } from "@/types";
import { cn } from "@/utils/cn";

export function WorkShowcase() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [activeTab, setActiveTab] = useState<ProjectCategory>("poster");
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProjects().then((data) => {
      if (!cancelled) setProjects(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(
    () =>
      (projects ?? [])
        .filter((project) => project.category === activeTab)
        .sort((a, b) => a.order - b.order),
    [projects, activeTab],
  );

  return (
    <section id="work" className="bg-world px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <span className="text-xs uppercase tracking-[0.3em] text-accent">Selected Work</span>
        <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">The inner world</h2>

        {/* sticky category tabs */}
        <div className="sticky top-[60px] z-30 -mx-6 mt-10 border-b border-line bg-world/90 px-6 py-3 backdrop-blur">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Project categories">
            {WORK_TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm transition-colors duration-300",
                  activeTab === tab.id
                    ? "bg-accent font-semibold text-night"
                    : "text-neutral-400 hover:text-white",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10">
          {projects === null ? (
            <Loader label="Loading projects…" />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabContent}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {visible.map((project) => (
                  <motion.button
                    key={project.id}
                    variants={gridItem}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => setSelected(project)}
                    className="glass group rounded-2xl p-1.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    {/* thin glass frame around the artwork */}
                    <div className="relative overflow-hidden rounded-xl">
                      <LazyImage
                        src={project.thumbnailUrl || null}
                        alt={project.title}
                        className="aspect-[4/3] w-full"
                        fallbackClassName={CATEGORY_GRADIENTS[project.category]}
                      />

                      {/* quick details on hover */}
                      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/25 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                        <h3 className="font-display font-semibold">{project.title}</h3>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {project.tags.slice(0, 3).map((tag) => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </div>
                      </div>

                      {(project.category === "video" || project.category === "motion") && (
                        <span className="glass absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-white">
                          <svg width="11" height="13" viewBox="0 0 11 13" fill="currentColor" aria-hidden="true">
                            <path d="M0.5 0.8v11.4l10-5.7-10-5.7z" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))}

                {visible.length === 0 && (
                  <p className="col-span-full py-16 text-center text-neutral-500">
                    No projects in this category yet.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
