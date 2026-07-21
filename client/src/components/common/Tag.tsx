import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-line bg-white/5 px-3 py-1 text-[11px] font-medium tracking-wide text-neutral-300">
      {children}
    </span>
  );
}
