import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroPortrait from "@/assets/images/hero-portrait.png";
import { Button } from "@/components/common/Button";
import { FloatingCard } from "@/components/common/FloatingCard";
import { CLOSING_COPY, HERO_CARDS } from "@/data/constants";
import { useProjectCovers } from "@/hooks/useProjectCovers";

/**
 * The circle closes: the Hero scene replays in reverse — the same cards fly back IN
 * from the opposite edges (mirror) and the portrait re-materializes as you scroll.
 */
export function Closing() {
  const sectionRef = useRef<HTMLElement>(null);
  const covers = useProjectCovers();
  // Progress starts the moment the section's top enters the viewport ("start end"),
  // not when it pins — so the scene is already forming while it slides up from
  // Contact, and there is no empty scroll gap before anything appears.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });

  const portraitScale = useTransform(scrollYProgress, [0, 0.5], [0.78, 1]);
  const portraitOpacity = useTransform(scrollYProgress, [0.03, 0.45], [0, 1]);
  const portraitY = useTransform(scrollYProgress, [0, 0.5], [60, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.5, 0.75], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.5, 0.75], [30, 0]);
  const backgroundColor = useTransform(scrollYProgress, [0, 0.45], ["#12141d", "#0b0b10"]);

  return (
    <section id="closing" ref={sectionRef} className="relative h-[160vh]">
      <motion.div style={{ backgroundColor }} className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 bg-spotlight" />
        <div className="absolute inset-0 bg-vignette" />

        {/* same cards, opposite direction — the loop closes */}
        {HERO_CARDS.map((card, index) => (
          <FloatingCard
            key={card.id}
            card={card}
            progress={scrollYProgress}
            mode="enter"
            mirror
            imageUrl={covers[index] ?? null}
          />
        ))}

        <motion.div
          style={{ scale: portraitScale, opacity: portraitOpacity, y: portraitY }}
          className="absolute inset-0 z-20 flex items-end justify-center"
        >
          <img
            src={heroPortrait}
            alt=""
            aria-hidden="true"
            className="h-[82vh] w-auto max-w-none bg-transparent object-contain drop-shadow-portrait"
            draggable={false}
          />
        </motion.div>

        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="absolute inset-x-0 bottom-14 z-30 flex flex-col items-center gap-4 px-6 text-center"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-accent">
            {CLOSING_COPY.eyebrow}
          </span>
          <h2 className="text-scene-shadow font-display text-3xl font-bold text-white sm:text-4xl">
            {CLOSING_COPY.title}
          </h2>
          <p className="text-scene-shadow max-w-md text-sm text-neutral-200">{CLOSING_COPY.text}</p>
          <Button href="#contact" variant="glass" className="mt-2">
            {CLOSING_COPY.cta}
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
