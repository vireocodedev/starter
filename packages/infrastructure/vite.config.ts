import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  plugins: [
    tsconfigPaths(),
    dts({ rollupTypes: true, tsconfigPath: "./tsconfig.json" }),
  ],
  build: {
    emptyOutDir: mode !== "watch",
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "axios",
        "dayjs",
        "@preact/signals-react",
        "@tanstack/react-query",
      ],
    },
    sourcemap: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.ts"],
  },
}));
