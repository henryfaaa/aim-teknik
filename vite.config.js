import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: [
      ".ngrok-free.app"   // perbolehkan semua subdomain ngrok
    ],
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
      "/uploads": { target: "http://localhost:5000", changeOrigin: true },
    },
  },
  preview: {
    port: 5173,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
