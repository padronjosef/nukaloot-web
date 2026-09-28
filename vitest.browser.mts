import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * The console guard, kept apart from the unit tests because it drives a real
 * browser against a running app. `npm test` stays fast; `npm run test:console`
 * is the one that answers "is the console clean".
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.browser.spec.ts"],
    // A real browser and a real search: the default 5s is not enough.
    testTimeout: 90_000,
    hookTimeout: 60_000,
    // Shared pages and one browser — parallel files would race for the port.
    fileParallelism: false,
  },
});
