import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  // Per-file declarations keep source modules independently inspectable while
  // the package exposes one deliberate root entry point.
  // `entryRoot: "src"` roots the emitted d.ts at dist/index.d.ts (not
  // dist/src/...), and tests are excluded from declaration output.
  plugins: [
    tsconfigPaths(),
    dts({
      rollupTypes: false,
      tsconfigPath: "./tsconfig.json",
      entryRoot: "src",
      exclude: ["tests/**", "docs/**", "**/*.test.ts"],
    }),
  ],
  build: {
    emptyOutDir: mode !== "watch",
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["zod"],
    },
    sourcemap: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.ts"],
  },
}));
