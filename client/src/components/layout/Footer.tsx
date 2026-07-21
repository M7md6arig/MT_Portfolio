import { SITE } from "@/data/constants";

export function Footer() {
  return (
    <footer className="border-t border-line bg-night px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-neutral-500 sm:flex-row">
        <span>
          © {new Date().getFullYear()} {SITE.fullName}. All rights reserved.
        </span>
        <span className="text-neutral-600">{SITE.role}</span>
      </div>
    </footer>
  );
}
