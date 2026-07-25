import { useEffect, useState } from "react";

// Matches Tailwind's `sm` breakpoint (640px) — anything narrower counts as mobile.
const MOBILE_QUERY = "(max-width: 639px)";

/** True below Tailwind's `sm` breakpoint. Reactive to viewport/orientation changes. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
