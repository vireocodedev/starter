import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";
import { defineConfig } from "vitest/config";

const configDirectory = path.join(import.meta.dirname, ".storybook-vireo");
const desktopViewport = { height: 900, width: 1440 };

export default defineConfig({
  optimizeDeps: { include: ["react/jsx-dev-runtime"] },
  test: {
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 30_000,
    projects: [
      {
        plugins: [
          storybookTest({
            configDir: configDirectory,
            initialGlobals: { vireoTheme: "dark" },
            tags: { skip: ["contract-debt"] },
          }),
        ],
        test: {
          name: "storybook-desktop-dark",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              contextOptions: { colorScheme: "dark", permissions: ["clipboard-read", "clipboard-write"] },
            }),
            instances: [{ browser: "chromium", name: "desktop-dark", viewport: desktopViewport }],
          },
        },
      },
      {
        plugins: [
          storybookTest({
            configDir: configDirectory,
            initialGlobals: { vireoTheme: "dark" },
            tags: { include: ["vireo-matrix"], skip: ["contract-debt"] },
          }),
        ],
        test: {
          name: "storybook-mobile-dark",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              contextOptions: { colorScheme: "dark", permissions: ["clipboard-read", "clipboard-write"] },
            }),
            instances: [{ browser: "chromium", name: "mobile-dark", viewport: { height: 844, width: 390 } }],
          },
        },
      },
      {
        plugins: [
          storybookTest({
            configDir: configDirectory,
            initialGlobals: { vireoTheme: "light" },
            tags: { include: ["vireo-matrix"], skip: ["contract-debt"] },
          }),
        ],
        test: {
          name: "storybook-light",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              contextOptions: { colorScheme: "light", permissions: ["clipboard-read", "clipboard-write"] },
            }),
            instances: [{ browser: "chromium", name: "desktop-light", viewport: desktopViewport }],
          },
        },
      },
      {
        plugins: [
          storybookTest({
            configDir: configDirectory,
            initialGlobals: { vireoTheme: "dark" },
            tags: { include: ["vireo-matrix"], skip: ["contract-debt"] },
          }),
        ],
        test: {
          name: "storybook-reduced-motion",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              contextOptions: {
                colorScheme: "dark",
                permissions: ["clipboard-read", "clipboard-write"],
                reducedMotion: "reduce",
              },
            }),
            instances: [{ browser: "chromium", name: "desktop-reduced", viewport: desktopViewport }],
          },
        },
      },
      {
        plugins: [
          storybookTest({
            configDir: configDirectory,
            initialGlobals: { vireoDirection: "rtl", vireoTheme: "dark" },
            tags: { include: ["vireo-matrix"], skip: ["contract-debt"] },
          }),
        ],
        test: {
          name: "storybook-rtl",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              contextOptions: { colorScheme: "dark", permissions: ["clipboard-read", "clipboard-write"] },
            }),
            instances: [{ browser: "chromium", name: "desktop-rtl", viewport: desktopViewport }],
          },
        },
      },
      {
        plugins: [
          storybookTest({
            configDir: configDirectory,
            initialGlobals: { vireoTheme: "dark" },
            tags: { include: ["vireo-matrix"], skip: ["contract-debt"] },
          }),
        ],
        test: {
          name: "storybook-forced-colors",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              contextOptions: {
                colorScheme: "dark",
                forcedColors: "active",
                permissions: ["clipboard-read", "clipboard-write"],
              },
            }),
            instances: [{ browser: "chromium", name: "desktop-forced-colors", viewport: desktopViewport }],
          },
        },
      },
      {
        plugins: [
          storybookTest({
            configDir: configDirectory,
            initialGlobals: { vireoTheme: "dark" },
            tags: { include: ["vireo-matrix"], skip: ["contract-debt"] },
          }),
        ],
        test: {
          name: "storybook-mobile-landscape",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              contextOptions: { colorScheme: "dark", permissions: ["clipboard-read", "clipboard-write"] },
            }),
            instances: [{ browser: "chromium", name: "mobile-landscape", viewport: { height: 390, width: 844 } }],
          },
        },
      },
    ],
  },
});
