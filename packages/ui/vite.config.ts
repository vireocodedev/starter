import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Per-file declarations: api-extractor's rollup cannot bundle the deep MUI /
  // @rgo type graphs. `entryRoot: "src"` roots the d.ts at dist/index.d.ts and
  // aliases are still rewritten to relative paths; tests are excluded.
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
        /^@mui\//,
        /^@rgo\//,
        /^@vireocodedev\//,
        /^sonner$/,
        /^react-hook-form($|\/)/,
        /^dayjs($|\/)/,
      ],
    },
    sourcemap: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.ts"],
  },
});
