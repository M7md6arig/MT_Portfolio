import { motion } from "framer-motion";
import { useState } from "react";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import { TRUSTED_CLIENTS, TRUSTED_COPY } from "@/data/constants";
import { cn } from "@/utils/cn";

/**
 * A strip of glass wordmark cards right after the Hero. Hovering a client
 * crossfades a subtle ambient glow (defined per client in data/constants)
 * across the whole section background, and fades back out on leave.
 */
export function TrustedBy() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section id="clients" className="relative overflow-hidden bg-night px-6 py-24">
      {/* one glow layer per client — opacity crossfade keeps the transition smooth */}
      {TRUSTED_CLIENTS.map((client) => (
        <div
          key={client.id}
          aria-hidden="true"
          style={{ background: client.glow }}
          className={cn(
            "pointer-events-none absolute inset-0 transition-opacity duration-[350ms] ease-out",
            activeId === client.id ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        className="relative mx-auto max-w-5xl"
      >
        <motion.p
          variants={fadeInUp}
          className="text-center text-xs uppercase tracking-[0.3em] text-neutral-500"
        >
          {TRUSTED_COPY.title}
        </motion.p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
          {TRUSTED_CLIENTS.map((client) => (
            <motion.div
              key={client.id}
              variants={fadeInUp}
              style={{ rotate: client.rotate }}
              whileHover={{ rotate: 0, scale: 1.06 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onMouseEnter={() => setActiveId(client.id)}
              onMouseLeave={() => setActiveId(null)}
              className="glass cursor-default rounded-xl px-7 py-4"
            >
              <span className="font-display text-sm font-semibold tracking-widest text-neutral-300">
                {client.name}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
