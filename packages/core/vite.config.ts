import { resolve } from "node:path";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  // Per-file declarations: api-extractor's rollup cannot bundle the deep MUI /
  // react-router type graphs. `entryRoot: "src"` roots the d.ts at
  // dist/index.d.ts; aliases are rewritten to relative paths; tests excluded.
  plugins: [
    tsconfigPaths(),
    dts({
      rollupTypes: false,
      tsconfigPath: "./tsconfig.json",
      entryRoot: "src",
      exclude: ["tests/**", "**/*.test.ts", "**/*.test.tsx"],
    }),
  ],
  build: {
    emptyOutDir: mode !== "watch",
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "offline/index": resolve(__dirname, "src/offline/index.ts"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^react-router($|\/)/,
        /^@mui\//,
        /^@vireocodedev\//,
        /^@tanstack\//,
        /^virtual:/,
      ],
    },
    sourcemap: true,
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
  },
}));
