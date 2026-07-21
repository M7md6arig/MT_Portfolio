import type { SiteSettings } from "@/types";

/** "#e0b15c" → "224 177 92" (the space-separated triplet Tailwind's rgb(var()) expects) */
function hexToTriplet(hex: string): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/** Mix a hex color towards white — used to derive accent-soft from the accent color */
function lighten(hex: string, amount: number): string {
  const value = hex.replace("#", "");
  const channel = (offset: number) => {
    const c = parseInt(value.slice(offset, offset + 2), 16);
    return Math.round(c + (255 - c) * amount);
  };
  return `${channel(0)} ${channel(2)} ${channel(4)}`;
}

/**
 * Injects the admin-configured palette as CSS custom properties on :root.
 * Tailwind colors (night / world / accent) resolve through these variables,
 * so the whole site re-themes without a rebuild.
 */
export function applyTheme(settings: SiteSettings): void {
  const root = document.documentElement.style;
  root.setProperty("--color-primary", hexToTriplet(settings.primaryColor));
  root.setProperty("--color-secondary", hexToTriplet(settings.secondaryColor));
  root.setProperty("--color-accent", hexToTriplet(settings.accentColor));
  root.setProperty("--color-accent-soft", lighten(settings.accentColor, 0.35));
}
