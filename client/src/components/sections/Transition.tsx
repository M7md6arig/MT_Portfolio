import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { TRANSITION_COPY } from "@/data/constants";

/**
 * ~50vh bridge between the meeting moment (night) and the inner world.
 * The background color is interpolated from the scroll position itself.
 */
export function Transition() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundColor = useTransform(scrollYProgress, [0.1, 0.9], ["#0b0b10", "#12141d"]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.8], [0, 1, 0]);
  const y = useTransform(scrollYProgress, [0.2, 0.8], [40, -40]);

  return (
    <motion.section
      ref={sectionRef}
      style={{ backgroundColor }}
      className="relative flex h-[50vh] items-center justify-center"
    >
      <motion.p
        style={{ opacity, y }}
        className="max-w-xl px-6 text-center font-display text-xl text-neutral-300 sm:text-2xl"
      >
        {TRANSITION_COPY}
      </motion.p>
    </motion.section>
  );
}
