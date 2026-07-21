import { MotionValue, motion, useTransform } from "framer-motion";
import { ARC } from "@/data/constants";
import type { HeroCardData } from "@/types";
import { cn } from "@/utils/cn";

interface FloatingCardProps {
  card: HeroCardData;
  /** Scroll progress of the parent scene (0 → 1). The card's orbit is a pure function of it. */
  progress: MotionValue<number>;
  /** "exit": orbits outward while scrolling (Hero). "enter": orbits back in (Closing). */
  mode?: "exit" | "enter";
  /** Reverse the orbit direction — the Closing scene mirrors the Hero. */
  mirror?: boolean;
  /** Real project artwork shown inside the card; without it the card stays plain glass. */
  imageUrl?: string | null;
}

const ASPECT: Record<HeroCardData["aspect"], string> = {
  portrait: "aspect-[3/4]",
  video: "aspect-video",
  square: "aspect-square",
};

/** height / width per aspect — used to center the card on its arc point */
const HEIGHT_FACTOR: Record<HeroCardData["aspect"], number> = {
  portrait: 4 / 3,
  video: 9 / 16,
  square: 1,
};

/**
 * Radius multiple that puts a card JUST past the frame edge (~1.5 clears it, a small
 * margin on top). Deliberately no larger: with a bigger value the card would spend
 * the tail of the scroll traveling while already invisible, so its on-screen exit
 * would land far earlier than the portrait's fade — the exact gap we're avoiding.
 */
const EXIT_RADIUS = 1.7;

/**
 * Two-phase orbit (exit mode): until ORBIT_PHASE_END the card keeps circling the
 * portrait at almost its resting radius, then accelerates outward and crosses the
 * frame edge in the last ~10% of the scroll — right as the portrait finishes its
 * own scale-down + fade (ends at 0.95 in Hero).
 * Enter mode (Closing) is the mirror: rush in during the first ~30%, then orbit.
 */
const ORBIT_PHASE_END = 0.7;
const ENTER_SETTLE_AT = 0.3;

const toRadians = (deg: number) => (deg * Math.PI) / 180;

export function FloatingCard({
  card,
  progress,
  mode = "exit",
  mirror = false,
  imageUrl = null,
}: FloatingCardProps) {
  // Orbital parallax: nearer cards sweep a wider angle per scroll unit, so they read as faster.
  const sweep = (mirror ? -1 : 1) * (70 + card.depth * 50);
  // Foreground cards (the ones layered in front of the portrait, depth ≥ 0.6) are fully
  // opaque so they never blend into the backdrop; depth cards keep their translucency
  // — that fade IS the parallax depth cue.
  const isForeground = card.depth >= 0.6;
  const restingOpacity = isForeground ? 1 : 0.3 + card.depth * 0.45;

  // Scroll drives the card's POLAR coordinates around the portrait's axis: the resting
  // angle gains a growing offset while the radius expands, so the card revolves around
  // the person on a curved path until it leaves the frame — no straight-line translateX.
  const angle = useTransform(
    progress,
    [0, 1],
    mode === "exit" ? [card.angle, card.angle + sweep] : [card.angle - sweep, card.angle],
  );
  const radius = useTransform(
    progress,
    mode === "exit" ? [0, ORBIT_PHASE_END, 1] : [0, ENTER_SETTLE_AT, 1],
    mode === "exit"
      ? [card.radiusScale, card.radiusScale * 1.15, EXIT_RADIUS]
      : [EXIT_RADIUS, card.radiusScale * 1.15, card.radiusScale],
  );

  const left = useTransform(
    () => `${ARC.cx + ARC.rx * radius.get() * Math.cos(toRadians(angle.get()))}%`,
  );
  const top = useTransform(
    () => `${ARC.cy - ARC.ry * radius.get() * Math.sin(toRadians(angle.get()))}%`,
  );

  // Full presence through the whole orbit phase; the fade only lands at the very
  // end, together with the portrait's own fade-out.
  const opacity = useTransform(
    progress,
    mode === "exit" ? [0, 0.85, 1] : [0, 0.25, 1],
    mode === "exit"
      ? [restingOpacity, restingOpacity * 0.85, 0]
      : [0, restingOpacity * 0.6, restingOpacity],
  );

  const width = Math.round(90 + card.depth * 90);
  const height = Math.round(width * HEIGHT_FACTOR[card.aspect]);

  // Layering against the portrait (z-20): near cards (depth ≥ 0.6) float in front of it,
  // far cards sit behind the body and get partially hidden at visual intersections.
  const zIndex = card.depth >= 0.6 ? 25 : Math.round(6 + card.depth * 12);

  return (
    <motion.div
      style={{
        left,
        top,
        opacity,
        width,
        marginLeft: -width / 2,
        marginTop: -height / 2,
        rotate: card.rotate,
        zIndex,
      }}
      className="absolute hidden sm:block"
      aria-hidden="true"
    >
      <div className={cn("glass relative overflow-hidden rounded-lg", ASPECT[card.aspect])}>
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            className={cn(
              "absolute inset-0 h-full w-full object-cover",
              isForeground ? "opacity-100" : "opacity-80",
            )}
          />
        )}
        <div
          className={cn(
            "relative flex h-full flex-col justify-end p-2.5",
            imageUrl && "bg-gradient-to-t from-black/60 to-transparent",
          )}
        >
          <span
            className={cn(
              "text-scene-shadow text-[9px] font-medium leading-snug tracking-wide",
              imageUrl ? "text-white" : "text-white/40",
            )}
          >
            {card.title}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
