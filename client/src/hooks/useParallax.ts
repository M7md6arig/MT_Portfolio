import { MotionValue, useScroll, useTransform } from "framer-motion";
import type { RefObject } from "react";

/**
 * Scroll-linked offset for an element while it crosses the viewport.
 * 100% bound to scroll position — stop scrolling and the motion freezes instantly.
 */
export function useParallax(
  ref: RefObject<HTMLElement>,
  distance: number,
): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  return useTransform(scrollYProgress, [0, 1], [-distance, distance]);
}
