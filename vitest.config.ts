import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Kept separate from vite.config.ts so tests don't boot the Cloudflare runtime.
export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react()],
        test: {
          name: "app",
          environment: "jsdom",
          setupFiles: ["./src/test/setup.ts"],
          include: ["src/**/*.test.{ts,tsx}"],
        },
      },
      {
        test: {
          name: "worker",
          environment: "node",
          setupFiles: ["./worker/test/setup.ts"],
          include: ["worker/**/*.test.ts"],
        },
      },
    ],
  },
});
