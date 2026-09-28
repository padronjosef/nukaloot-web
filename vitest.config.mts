import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // Everything under test here is pure or a plain store, so no DOM is
    // needed. Add jsdom the day a component test shows up, not before.
    environment: "node",
    include: ["src/**/*.spec.ts"],
  },
});
