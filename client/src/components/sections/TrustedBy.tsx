import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fadeInUp } from "@/animations/variants";
import { Marquee } from "@/components/common/Marquee";
import { TRUSTED_CLIENTS, TRUSTED_COPY } from "@/data/constants";
import { fetchClients } from "@/services/api";
import type { Client } from "@/types";

type ClientView = Pick<Client, "id" | "name" | "logoUrl" | "backgroundUrl">;

/** Used until real clients load (or if the API/table isn't available yet) — name-only cards, no logo. */
const FALLBACK_CLIENTS: ClientView[] = TRUSTED_CLIENTS.map((c) => ({
  id: c.id,
  name: c.name,
  logoUrl: null,
  backgroundUrl: null,
}));

/**
 * Dark card showing a client's logo forced to white. Hovering reveals the
 * client's background pattern (when set) crossfaded in behind it, dimmed so
 * the logo stays legible; without a background the card simply does nothing
 * on hover — no error, no visual change.
 */
function ClientCard({ client }: { client: ClientView }) {
  const hasBackground = Boolean(client.backgroundUrl);

  return (
    <div className="group relative flex h-24 w-44 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-black transition-colors duration-300 hover:border-accent/40 sm:h-28 sm:w-52">
      {hasBackground && (
        <>
          <img
            src={client.backgroundUrl!}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-black/55 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" />
        </>
      )}

      <div className="relative px-6">
        {client.logoUrl ? (
          <img
            src={client.logoUrl}
            alt={client.name}
            loading="lazy"
            className="max-h-10 max-w-full object-contain"
            style={{ filter: "brightness(0) invert(1) drop-shadow(0 2px 6px rgba(0,0,0,0.45))" }}
          />
        ) : (
          <span className="font-display text-sm font-semibold tracking-widest text-white/70">
            {client.name}
          </span>
        )}
      </div>
    </div>
  );
}

export function TrustedBy() {
  const [clients, setClients] = useState<ClientView[]>(FALLBACK_CLIENTS);

  useEffect(() => {
    let cancelled = false;
    fetchClients().then((data) => {
      if (!cancelled && data.length > 0) setClients(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="clients" className="border-y border-line bg-night py-20">
      <motion.p
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
        className="mb-10 text-center text-xs uppercase tracking-[0.3em] text-neutral-500"
      >
        {TRUSTED_COPY.title}
      </motion.p>

      <Marquee items={clients.map((client) => ({ id: client.id, node: <ClientCard client={client} /> }))} />
    </section>
  );
}
