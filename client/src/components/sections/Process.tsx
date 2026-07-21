import { MotionValue, motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { PROCESS_COPY, PROCESS_STEPS } from "@/data/constants";
import type { ProcessStep as ProcessStepData } from "@/types";
import { cn } from "@/utils/cn";

/**
 * The wave rides the visible corridor between the two card rows (y = 200) and only
 * makes a NARROW spike behind the facing edge of each card: up to y = 150 near the
 * right edge of top cards (x ≈ 190, 690) and down to y = 250 near the left edge of
 * bottom cards (x ≈ 305, 810). Card edges sit at y ≈ 170 / 230, so each spike dips
 * just ~20 units behind an edge — hiding ≤ 20% of the card's width and keeping the
 * drawing motion visible almost the whole time. Baseline crossings land in the gaps
 * between columns (x ≈ 245, 750), so the line "stitches" adjacent card corners.
 */
const WAVE_PATH =
  "M0 200 C 150 200, 165 150, 190 150 S 265 250, 305 250 S 380 200, 460 200 C 590 200, 660 150, 690 150 S 770 250, 810 250 S 900 200, 1000 200";

/**
 * The journey section: the user scrolls vertically as usual, but the scene is pinned
 * (sticky) while a horizontal wavy SVG path draws itself left-to-right with the scroll.
 * `pathLength={1}` normalizes the path's length so strokeDasharray is exactly 1 and
 * strokeDashoffset animates 1 → 0 straight from scrollYProgress.
 * The cards render ABOVE the line (z-10 vs the SVG's z-0): each card's facing edge
 * briefly clips the stroke, so the line reads as hooking behind the card's corner —
 * touching it for a moment — rather than crossing its full width.
 */
export function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const strokeDashoffset = useTransform(scrollYProgress, [0.05, 0.95], [1, 0]);

  return (
    <section id="process" ref={sectionRef} className="relative h-[160vh] bg-world">
      <div className="sticky top-0 flex h-screen flex-col justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-6xl">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">Process</span>
          <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{PROCESS_COPY.title}</h2>
          <p className="mt-3 max-w-xl text-neutral-400">{PROCESS_COPY.subtitle}</p>

          <div className="relative mt-14">
            {/* the line layer — spans the whole field, behind the cards */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 1000 400"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              {/* faint full track so the remaining journey is always hinted */}
              <path d={WAVE_PATH} stroke="rgba(255,255,255,0.05)" strokeWidth="1.3" />
              {/* the golden stroke that draws itself with the scroll */}
              <motion.path
                d={WAVE_PATH}
                pathLength={1}
                strokeDasharray="1"
                style={{ strokeDashoffset }}
                stroke="#e0b15c"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>

            {/* card layer — alternating top/bottom, each column crossed by the wave */}
            <div className="relative z-10 grid grid-cols-4 gap-3 sm:gap-5">
              {PROCESS_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex min-h-[360px] flex-col sm:min-h-[400px]",
                    index % 2 === 0 ? "justify-start" : "justify-end",
                  )}
                >
                  <StepCard step={step} index={index} progress={scrollYProgress} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface StepCardProps {
  step: ProcessStepData;
  index: number;
  progress: MotionValue<number>;
}

/** Dimmed (0.25) until the drawn stroke reaches its anchor, then fades + slides in. */
function StepCard({ step, index, progress }: StepCardProps) {
  const opacity = useTransform(progress, [step.at - 0.12, step.at], [0.25, 1]);
  const y = useTransform(progress, [step.at - 0.12, step.at], [24, 0]);

  return (
    <motion.div style={{ opacity, y }} className="glass w-full rounded-2xl p-4 sm:p-6">
      <span className="font-display text-xs font-bold tracking-[0.25em] text-accent">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="mt-2 font-display text-sm font-semibold sm:text-lg">{step.title}</h3>
      <p className="mt-2 hidden text-sm leading-relaxed text-neutral-400 sm:block">
        {step.description}
      </p>
    </motion.div>
  );
}
