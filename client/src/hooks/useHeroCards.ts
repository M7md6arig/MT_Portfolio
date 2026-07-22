import { useEffect, useState } from "react";
import { HERO_CARDS } from "@/data/constants";
import { fetchHeroCards, fetchProjects } from "@/services/api";
import type { HeroCardData, HeroCardContent } from "@/types";
import { coverUrl } from "@/utils/project";

export interface HeroCardView {
  /** Layout data from constants, with the dashboard title override applied. */
  card: HeroCardData;
  imageUrl: string | null;
  /** Native dimensions of a dashboard-uploaded image — drives the card's aspect. */
  imageSize: { width: number; height: number } | null;
}

const DEFAULT_VIEWS: HeroCardView[] = HERO_CARDS.map((card) => ({
  card,
  imageUrl: null,
  imageSize: null,
}));

/**
 * The hero/closing floating cards: fixed layout slots from constants, dressed
 * with dashboard-managed titles and artwork. Slots without a custom image fall
 * back to the project covers (ordered), keeping the previous behavior.
 */
export function useHeroCards(): HeroCardView[] {
  const [views, setViews] = useState<HeroCardView[]>(DEFAULT_VIEWS);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchHeroCards(), fetchProjects()]).then(([overrides, projects]) => {
      if (cancelled) return;
      const bySlot = new Map<string, HeroCardContent>(overrides.map((o) => [o.id, o]));
      const covers = [...projects].sort((a, b) => a.order - b.order).map(coverUrl);

      setViews(
        HERO_CARDS.map((card, index) => {
          const db = bySlot.get(card.id);
          const hasCustomImage = Boolean(db?.imageUrl);
          return {
            card: db?.title ? { ...card, title: db.title } : card,
            imageUrl: db?.imageUrl ?? covers[index] ?? null,
            imageSize:
              hasCustomImage && db?.imageWidth && db?.imageHeight
                ? { width: db.imageWidth, height: db.imageHeight }
                : null,
          };
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return views;
}
