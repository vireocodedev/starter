import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), dts({ rollupTypes: true, tsconfigPath: "./tsconfig.json" })],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom", "axios", "dayjs", "@preact/signals-react", "@tanstack/react-query"],
    },
    sourcemap: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.ts"],
  },
});
