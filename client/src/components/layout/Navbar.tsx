import { NAV_LINKS, SITE } from "@/data/constants";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { cn } from "@/utils/cn";

export function Navbar() {
  const progress = useScrollProgress();
  const scrolled = progress > 0.02;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-500",
        scrolled ? "border-b border-white/10 bg-white/5 shadow-glass backdrop-blur-lg" : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#hero" className="font-display text-lg font-bold tracking-widest text-accent">
          {SITE.name}
          <span className="text-white/50">.studio</span>
        </a>
        <ul className="hidden gap-8 text-sm text-neutral-300 sm:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition-colors duration-300 hover:text-accent">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
