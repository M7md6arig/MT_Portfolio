import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import { ABOUT } from "@/data/constants";

export function About() {
  return (
    <section id="about" className="bg-world px-6 py-28">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-4xl"
      >
        <motion.span variants={fadeInUp} className="text-xs uppercase tracking-[0.3em] text-accent">
          About
        </motion.span>
        <motion.h2 variants={fadeInUp} className="mt-4 font-display text-3xl font-bold sm:text-4xl">
          {ABOUT.title}
        </motion.h2>
        <motion.p variants={fadeInUp} className="mt-6 max-w-2xl leading-relaxed text-neutral-400">
          {ABOUT.bio}
        </motion.p>

        <motion.div variants={fadeInUp} className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3">
          {ABOUT.stats.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-6">
              <div className="font-display text-3xl font-bold text-accent">{stat.value}</div>
              <div className="mt-2 text-sm text-neutral-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
