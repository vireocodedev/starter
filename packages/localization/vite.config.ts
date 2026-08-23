import { resolve } from "node:path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
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
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["i18next"],
    },
    sourcemap: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.ts"],
  },
}));
