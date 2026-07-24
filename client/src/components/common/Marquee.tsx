import { ReactNode, useMemo, useState } from "react";
import { cn } from "@/utils/cn";

interface MarqueeItem {
  id: string;
  node: ReactNode;
}

interface MarqueeProps {
  items: MarqueeItem[];
  /** Short lists repeat until this many items appear in one lap, so the strip never shows gaps. */
  minItems?: number;
  /** Lower = faster. Total loop duration scales with lap length, so per-item pace stays constant. */
  secondsPerItem?: number;
  reverse?: boolean;
  className?: string;
}

/**
 * A seamless, infinitely-looping horizontal strip. The lap is duplicated
 * exactly once — animating the combined track by -50% always lines the second
 * copy up perfectly with the first, so the loop never jumps, regardless of
 * item count or width. Pausing on hover freezes the whole strip; per-item
 * hover effects (see TrustedBy's ClientCard) keep working independently.
 */
export function Marquee({ items, minItems = 10, secondsPerItem = 3.5, reverse = false, className }: MarqueeProps) {
  const [paused, setPaused] = useState(false);

  const lap = useMemo(() => {
    if (items.length === 0) return [];
    const repeat = Math.max(1, Math.ceil(minItems / items.length));
    const out: MarqueeItem[] = [];
    for (let r = 0; r < repeat; r++) {
      for (const item of items) out.push({ id: `${item.id}-r${r}`, node: item.node });
    }
    return out;
  }, [items, minItems]);

  if (lap.length === 0) return null;

  const durationSeconds = lap.length * secondsPerItem;

  return (
    <div
      className={cn("overflow-hidden", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="marquee-track flex w-max gap-5"
        style={{
          animationName: reverse ? "marquee-reverse" : "marquee",
          animationDuration: `${durationSeconds}s`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {[...lap, ...lap].map((item, index) => (
          <div key={`${item.id}-${index}`}>{item.node}</div>
        ))}
      </div>
    </div>
  );
}
