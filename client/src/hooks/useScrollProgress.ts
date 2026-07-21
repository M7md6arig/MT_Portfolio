import { useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";

/** Whole-page scroll progress as plain state (0 → 1). Used by the Navbar. */
export function useScrollProgress(): number {
  const { scrollYProgress } = useScroll();
  const [progress, setProgress] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setProgress(value);
  });

  return progress;
}
