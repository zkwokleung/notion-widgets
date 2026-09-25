import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  environments: {
    client: {
      build: {
        rolldownOptions: {
          output: {
            // Vendor code changes rarely; separate chunks stay cached across deploys.
            codeSplitting: {
              groups: [
                { name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
                { name: "router", test: /node_modules[\\/]react-router[\\/]/ },
                { name: "zod", test: /node_modules[\\/]zod[\\/]/ },
                { name: "vendor", test: /node_modules[\\/]/ },
              ],
            },
          },
        },
      },
    },
  },
});
