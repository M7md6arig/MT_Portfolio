/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0b0b10", // the "meeting moment" — Hero & Closing
        world: "#12141d", // the "inner world" — everything in between
        accent: {
          DEFAULT: "#e0b15c",
          soft: "#f0cd8a",
        },
        line: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        display: ["Sora", "Segoe UI", "system-ui", "sans-serif"],
        body: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 20px 60px -20px rgba(0,0,0,0.7)",
        glow: "0 0 80px rgba(224,177,92,0.15)",
        "glow-soft": "0 0 16px rgba(224,177,92,0.18)",
        glass: "0 8px 32px rgba(0,0,0,0.25)",
      },
      dropShadow: {
        portrait: "0 30px 80px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        // faint warm key light behind the portrait (Hero & Closing stages)
        spotlight: "radial-gradient(ellipse at center, rgba(224,177,92,0.05), transparent 60%)",
        // cinematic edge darkening that pulls the eye to the center
        vignette: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)",
      },
    },
  },
  plugins: [],
};
