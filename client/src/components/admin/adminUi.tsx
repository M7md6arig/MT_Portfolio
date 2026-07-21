import { LabelHTMLAttributes, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

/** Transient success note: `flash("Saved ✓")` shows the message for a few seconds. */
export function useFlash(): [string | null, (message: string) => void] {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number>();

  const flash = useCallback((next: string) => {
    setMessage(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(null), 2500);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return [message, flash];
}

export function FlashNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <span aria-live="polite" className="text-sm font-medium text-emerald-400">
      {message}
    </span>
  );
}

export const adminInput =
  "w-full rounded-xl border border-line bg-night/60 px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 transition-colors duration-300 focus:border-accent/60 focus:outline-none";

export function Field({
  label,
  children,
  className,
  ...rest
}: { label: string; children: ReactNode } & LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("block space-y-1.5", className)} {...rest}>
      <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">{label}</span>
      {children}
    </label>
  );
}

export function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={onEdit}
        className="rounded-lg border border-line px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-accent/60 hover:text-accent"
      >
        Edit
      </button>
      <button
        onClick={onDelete}
        className="rounded-lg border border-line px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-red-500/60 hover:text-red-400"
      >
        Delete
      </button>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {message}
    </p>
  );
}
