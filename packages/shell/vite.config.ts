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
        /^@preact\/signals-react($|\/)/,
        /^@vireocodedev\//,
        /^@tanstack\//,
        /^virtual:/,
      ],
    },
    sourcemap: true,
  },
  // Keep source aliases test-only so unit tests do not require prebuilt
  // workspaces while production builds retain package-boundary resolution.
  resolve:
    mode === "test"
      ? {
          alias: [
            {
              find: /^@vireocodedev\/starter-history$/,
              replacement: resolve(__dirname, "../history/src/index.ts"),
            },
            {
              find: /^@vireocodedev\/starter-infrastructure$/,
              replacement: resolve(__dirname, "../infrastructure/src/index.ts"),
            },
            {
              find: /^@vireocodedev\/starter-localization$/,
              replacement: resolve(__dirname, "../localization/src/index.ts"),
            },
            {
              find: /^@vireocodedev\/starter-ui\/react-i18next$/,
              replacement: resolve(__dirname, "../ui/src/integrations/react-i18next/public.ts"),
            },
            {
              find: /^@vireocodedev\/starter-ui$/,
              replacement: resolve(__dirname, "../ui/src/index.ts"),
            },
          ],
        }
      : undefined,
  test: {
    environment: "jsdom",
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    maxWorkers: 8,
    pool: "threads",
    setupFiles: ["tests/setup.ts"],
  },
}));
