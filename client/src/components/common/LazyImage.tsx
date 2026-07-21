import { useState } from "react";
import { cn } from "@/utils/cn";

interface LazyImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  /** Tailwind gradient stops for the placeholder / fallback layer */
  fallbackClassName?: string;
}

/**
 * Lazy image with a blur-up placeholder.
 * With no src (or a failed load) it keeps the gradient layer — the site never shows a broken image.
 */
export function LazyImage({ src, alt, className, fallbackClassName }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const showImage = Boolean(src) && !failed;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br transition-opacity duration-700",
          fallbackClassName ?? "from-neutral-700/40 to-neutral-900",
          showImage && loaded ? "opacity-0" : "opacity-100",
          showImage && !loaded && "animate-pulse",
        )}
      />
      {showImage && (
        <img
          src={src ?? undefined}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "h-full w-full object-cover transition-[opacity,filter] duration-700",
            loaded ? "opacity-100 blur-0" : "opacity-0 blur-md",
          )}
        />
      )}
    </div>
  );
}
