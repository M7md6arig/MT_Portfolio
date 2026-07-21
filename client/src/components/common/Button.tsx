import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold tracking-wide transition-colors duration-300";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-night shadow-glow hover:bg-accent-soft",
  ghost: "border border-line text-neutral-200 hover:border-accent/60 hover:text-accent",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Render as an anchor instead of a button */
  href?: string;
  /** Open the href in a new tab */
  external?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  href,
  external = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(base, variants[variant], className);

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
