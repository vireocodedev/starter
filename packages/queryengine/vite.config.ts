import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // rollupTypes is intentionally disabled: api-extractor cannot bundle
  // @tanstack/react-query's unique-symbol `DataTag` types (re-exported via the
  // query layer). Per-file declarations still rewrite the `@/*` aliases to
  // relative paths, so consumers get a clean, self-contained d.ts tree.
  // `entryRoot: "src"` roots the emitted d.ts at dist/index.d.ts (not
  // dist/src/...), and tests are excluded from declaration output.
  plugins: [
    tsconfigPaths(),
    dts({
      rollupTypes: false,
      tsconfigPath: "./tsconfig.json",
      entryRoot: "src",
      exclude: ["tests/**", "**/*.test.ts"],
    }),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom", "zod", "@tanstack/react-query", "@preact/signals-react"],
    },
    sourcemap: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.ts"],
  },
});
