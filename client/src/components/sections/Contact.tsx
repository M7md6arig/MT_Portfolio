import { motion } from "framer-motion";
import { FormEvent, useEffect, useState } from "react";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import { Button } from "@/components/common/Button";
import { IconLink } from "@/components/common/IconLink";
import { CONTACT_COPY } from "@/data/constants";
import { fetchSocialLinks, sendContactMessage } from "@/services/api";
import type { SocialLink } from "@/types";

type FormStatus = "idle" | "sending" | "sent" | "error";

const inputClasses =
  "w-full rounded-xl border border-line bg-night/60 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 transition-colors duration-300 focus:border-accent/60 focus:outline-none";

export function Contact() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<FormStatus>("idle");

  useEffect(() => {
    let cancelled = false;
    fetchSocialLinks().then((data) => {
      if (!cancelled) setSocialLinks(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    try {
      await sendContactMessage(form);
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="bg-world px-6 py-28">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-3xl"
      >
        <motion.span variants={fadeInUp} className="text-xs uppercase tracking-[0.3em] text-accent">
          Contact
        </motion.span>
        <motion.h2 variants={fadeInUp} className="mt-4 font-display text-3xl font-bold sm:text-4xl">
          {CONTACT_COPY.title}
        </motion.h2>
        <motion.p variants={fadeInUp} className="mt-3 text-neutral-400">
          {CONTACT_COPY.subtitle}
        </motion.p>

        <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap gap-4">
          {socialLinks.map((link) => (
            <IconLink key={link.id} href={link.url} label={link.platform} icon={link.icon} />
          ))}
        </motion.div>

        <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="mt-12 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <input
              type="text"
              required
              minLength={2}
              maxLength={80}
              placeholder="Your name"
              aria-label="Your name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClasses}
            />
            <input
              type="email"
              required
              placeholder="Your email"
              aria-label="Your email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={inputClasses}
            />
          </div>
          <textarea
            required
            minLength={10}
            maxLength={3000}
            rows={5}
            placeholder="Tell me about your project…"
            aria-label="Your message"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className={inputClasses}
          />

          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send message"}
            </Button>
            {status === "sent" && (
              <span className="text-sm text-emerald-400">Message sent — talk soon!</span>
            )}
            {status === "error" && (
              <span className="text-sm text-rose-400">
                Couldn't send right now. Please try again or reach out on social.
              </span>
            )}
          </div>
        </motion.form>
      </motion.div>
    </section>
  );
}
