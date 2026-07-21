import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import { Button } from "@/components/common/Button";
import { SERVICES_COPY } from "@/data/constants";
import { fetchServices } from "@/services/api";
import type { Service } from "@/types";

/** Stroke icons keyed by Service.icon */
const SERVICE_ICONS: Record<string, ReactNode> = {
  poster: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 16l3-4 2 2.5L16 10l0 0" />
      <circle cx="9" cy="8" r="1.5" />
    </>
  ),
  motion: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </>
  ),
  uiux: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="2" y1="8" x2="22" y2="8" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </>
  ),
  web: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
};

export function Services() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchServices().then((data) => {
      if (!cancelled) setServices(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="services" className="bg-world px-6 py-28">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-6xl"
      >
        <motion.span variants={fadeInUp} className="text-xs uppercase tracking-[0.3em] text-accent">
          Services
        </motion.span>
        <motion.h2 variants={fadeInUp} className="mt-4 font-display text-3xl font-bold sm:text-4xl">
          {SERVICES_COPY.title}
        </motion.h2>
        <motion.p variants={fadeInUp} className="mt-3 text-neutral-400">
          {SERVICES_COPY.subtitle}
        </motion.p>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              className="rounded-2xl border border-line bg-night/40 p-6 transition-colors duration-300 hover:border-accent/40"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-accent">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {SERVICE_ICONS[service.icon] ?? SERVICE_ICONS.web}
                </svg>
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{service.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeInUp} className="mt-14 text-center">
          <Button href="#contact">{SERVICES_COPY.cta}</Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
