import { useEffect, useState } from "react";
import { fetchProjects } from "@/services/api";
import { coverUrl } from "@/utils/project";

/**
 * Cover images of the portfolio projects (ordered), used to dress the floating
 * cards in the Hero and Closing scenes with real work instead of empty glass.
 */
export function useProjectCovers(): (string | null)[] {
  const [covers, setCovers] = useState<(string | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchProjects().then((projects) => {
      if (!cancelled) {
        setCovers([...projects].sort((a, b) => a.order - b.order).map(coverUrl));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return covers;
}
