import type { StorybookConfig } from "@storybook/react-vite";
import { resolve } from "node:path";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../src/**/Vireo*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      resolve: {
        alias: [
          {
            find: /^@vireocodedev\/starter-ui\/storybook\/VireoIconContainer$/,
            replacement: resolve(__dirname, "../storybook/VireoIconContainer/index.ts"),
          },
          {
            find: /^@vireocodedev\/starter-ui\/storybook$/,
            replacement: resolve(__dirname, "../storybook/index.ts"),
          },
          {
            find: /^@vireocodedev\/starter-ui$/,
            replacement: resolve(__dirname, "./starter-ui-entry.ts"),
          },
          { find: "@", replacement: resolve(__dirname, "../src") },
          {
            find: /^@mui\/icons-material$/,
            replacement: resolve(__dirname, "./mui-icons.ts"),
          },
        ],
      },
    });
  },
};

export default config;
