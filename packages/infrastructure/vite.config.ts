import { resolve } from "node:path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  // Per-file declarations avoid API Extractor failures on TanStack Query's
  // private symbol graph while preserving a clean root declaration entrypoint.
  plugins: [
    dts({
      bundleTypes: false,
      tsconfigPath: "./tsconfig.json",
      entryRoot: "src",
      exclude: ["tests/**", "docs/**", "**/*.test.ts"],
    }),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: [{ find: /^@\//, replacement: `${resolve(import.meta.dirname, "src")}/` }],
  },
  build: {
    emptyOutDir: mode !== "watch",
    lib: {
      entry: {
        index: "src/index.ts",
        "http/pagination": "src/http/pagination.ts",
        "network/appNetworkStatus": "src/network/appNetworkStatus.ts",
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ["axios", "zod", "@preact/signals-core"],
    },
    sourcemap: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.ts"],
  },
}));
