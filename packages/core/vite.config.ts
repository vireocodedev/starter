import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Per-file declarations: api-extractor's rollup cannot bundle the deep MUI /
  // @rgo / react-router type graphs. `entryRoot: "src"` roots the d.ts at
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
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^react-router($|\/)/,
        /^@mui\//,
        /^@rgo\//,
        /^@vireocodedev\//,
        /^@tanstack\//,
        /^virtual:/,
      ],
    },
    sourcemap: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.ts"],
  },
});
