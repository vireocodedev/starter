import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Tests only. The package is built with `tsc` (see tsconfig.build.json) so that
// dist mirrors src file-for-file and consumers can deep-import subpaths.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
  },
});
