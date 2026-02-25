import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,   // listen on 0.0.0.0 — accessible from other devices on the LAN
    port: 5173,
  },
});
