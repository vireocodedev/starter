import { resolve } from "node:path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  // Per-file declarations rather than a rolled-up bundle: `./offline` is a
  // second entry point, and api-extractor's rollup emits a single d.ts.
  // `entryRoot: "src"` roots them at dist/index.d.ts and dist/offline/index.d.ts.
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
        index: resolve(import.meta.dirname, "src/index.ts"),
        "offline/index": resolve(import.meta.dirname, "src/offline/index.ts"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ["@sqlite.org/sqlite-wasm"],
    },
    sourcemap: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.ts"],
  },
}));
