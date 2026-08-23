import { availableParallelism } from "node:os";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

// Tests only. The package is built with `tsc` (see tsconfig.build.json) so that
// dist mirrors src file-for-file and consumers can deep-import subpaths.
export default defineConfig({
  // Unit tests consume workspace dependencies from source. Production builds
  // and strict consumer checks validate the published dist entry points.
  resolve: {
    tsconfigPaths: true,
    alias: [
      {
        find: /^@\//,
        replacement: `${resolve(import.meta.dirname, "src")}/`,
      },
      {
        find: /^@vireocodedev\/starter-infrastructure$/,
        replacement: resolve(import.meta.dirname, "../infrastructure/src/index.ts"),
      },
      {
        find: /^@vireocodedev\/starter-infrastructure\/network-status$/,
        replacement: resolve(import.meta.dirname, "../infrastructure/src/network/appNetworkStatus.ts"),
      },
      {
        find: /^@vireocodedev\/starter-infrastructure\/pagination$/,
        replacement: resolve(import.meta.dirname, "../infrastructure/src/http/pagination.ts"),
      },
      {
        find: /^@vireocodedev\/starter-history$/,
        replacement: resolve(import.meta.dirname, "../history/src/index.ts"),
      },
      {
        find: /^@vireocodedev\/starter-localization$/,
        replacement: resolve(import.meta.dirname, "../localization/src/index.ts"),
      },
    ],
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"],
    // Do not oversubscribe small CI runners: jsdom interaction tests become
    // slower than Vitest's per-test timeout when more workers compete than the
    // machine can actually execute. Keep the established 16-worker ceiling on
    // larger development machines while respecting cgroup-aware CPU capacity.
    maxWorkers: Math.min(16, availableParallelism()),
    pool: "threads",
    setupFiles: ["tests/setup.ts"],
  },
});
