import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroPortrait from "@/assets/images/hero-portrait.png";
import { FloatingCard } from "@/components/common/FloatingCard";
import { HERO_CARDS, HERO_COPY } from "@/data/constants";
import { useProjectCovers } from "@/hooks/useProjectCovers";

/**
 * The opening scene. The section is 260vh tall while the visual stays pinned (sticky),
 * so scroll progress is measured against the Hero's own height only — cards move as a
 * pure function of scroll and freeze the instant the user stops.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const covers = useProjectCovers();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // The portrait holds the frame, then scales down and dissolves to hand over to the Transition.
  const portraitScale = useTransform(scrollYProgress, [0.5, 1], [1, 0.78]);
  const portraitOpacity = useTransform(scrollYProgress, [0.55, 0.95], [1, 0]);
  const portraitY = useTransform(scrollYProgress, [0.5, 1], [0, 60]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  return (
    <section id="hero" ref={sectionRef} className="relative h-[260vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* cinematic backdrop: dark stage + faint warm spotlight + edge vignette */}
        <div className="absolute inset-0 bg-night" />
        <div className="absolute inset-0 bg-spotlight" />
        <div className="absolute inset-0 bg-vignette" />

        {/* floating work cards, arced around the portrait, each on its own depth */}
        {HERO_CARDS.map((card, index) => (
          <FloatingCard
            key={card.id}
            card={card}
            progress={scrollYProgress}
            mode="exit"
            imageUrl={covers[index] ?? null}
          />
        ))}

        {/* transparent PNG straight over the dark scene — no backdrop behind it */}
        <motion.div
          style={{ scale: portraitScale, opacity: portraitOpacity, y: portraitY }}
          className="absolute inset-0 z-20 flex items-end justify-center"
        >
          <img
            src={heroPortrait}
            alt={`Portrait of ${HERO_COPY.title}, art director`}
            className="h-[82vh] w-auto max-w-none bg-transparent object-contain drop-shadow-portrait"
            draggable={false}
          />
        </motion.div>

        <motion.div
          style={{ opacity: titleOpacity }}
          className="absolute inset-x-0 bottom-14 z-30 flex flex-col items-center gap-3 px-6 text-center"
        >
          <h1 className="text-scene-shadow font-display text-3xl font-bold text-white sm:text-5xl">
            {HERO_COPY.title}
          </h1>
          <p className="text-scene-shadow max-w-md text-sm text-neutral-200">{HERO_COPY.subtitle}</p>
          <div className="mt-4 flex flex-col items-center gap-2">
            <span className="text-scene-shadow text-[10px] uppercase tracking-[0.3em] text-neutral-300">
              {HERO_COPY.scrollHint}
            </span>
            <div className="h-10 w-6 rounded-full border border-line p-1">
              <motion.div
                animate={{ y: [0, 14, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                className="h-2 w-2 rounded-full bg-accent"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
