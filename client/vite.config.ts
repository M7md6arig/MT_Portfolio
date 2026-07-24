import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@shared": fileURLToPath(new URL("../shared", import.meta.url)),
    },
  },
  server: {
    port: 5180,
    // Makes the API appear same-origin to the browser (localhost:5180/api/...)
    // so the httpOnly auth cookies (SameSite=strict) actually get sent —
    // mirrors the rewrite in client/vercel.json used in production.
    proxy: {
      "/api": {
        target: "http://localhost:4180",
        changeOrigin: true,
      },
    },
  },
});
