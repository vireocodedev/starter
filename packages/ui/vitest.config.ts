import { resolve } from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Tests only. The package is built with `tsc` (see tsconfig.build.json) so that
// dist mirrors src file-for-file and consumers can deep-import subpaths.
export default defineConfig({
  plugins: [tsconfigPaths()],
  // Unit tests consume workspace dependencies from source. Production builds
  // and strict consumer checks validate the published dist entry points.
  resolve: {
    alias: [
      {
        find: /^@vireocodedev\/starter-history$/,
        replacement: resolve(__dirname, "../history/src/index.ts"),
      },
      {
        find: /^@vireocodedev\/starter-localization$/,
        replacement: resolve(__dirname, "../localization/src/index.ts"),
      },
    ],
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"],
    maxWorkers: 16,
    pool: "threads",
    setupFiles: ["tests/setup.ts"],
  },
});
