import type { StorybookConfig } from "@storybook/react-vite";
import { resolve } from "node:path";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: [
    "../docs/storybook/**/*.mdx",
    "../../history/docs/storybook/**/*.mdx",
    "../../localization/docs/storybook/**/*.mdx",
    "../src/**/{Vireo,useVireo}*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(viteConfig) {
    const reactDocgenPlugin = viteConfig.plugins?.find(plugin => {
      return typeof plugin === "object" && plugin?.name === "storybook:react-docgen-plugin";
    });

    if (
      reactDocgenPlugin &&
      typeof reactDocgenPlugin === "object" &&
      typeof reactDocgenPlugin.transform === "function"
    ) {
      const transform = reactDocgenPlugin.transform;

      reactDocgenPlugin.transform = function (code, id, ...args) {
        const isStoryOnlySource =
          id.includes("/internal/storybook/") ||
          id.includes("/packages/ui/storybook/") ||
          id.includes("/packages/ui/.storybook-vireo/") ||
          /\.stories\.[cm]?[jt]sx?(?:\?|$)/.test(id);

        return isStoryOnlySource ? undefined : transform.call(this, code, id, ...args);
      };
    }

    return mergeConfig(viteConfig, {
      resolve: {
        alias: [
          {
            find: /^@vireo-storybook\/documentation$/,
            replacement: resolve(__dirname, "../storybook/documentation/index.ts"),
          },
          {
            find: /^@vireocodedev\/starter-history$/,
            replacement: resolve(__dirname, "../../history/src/index.ts"),
          },
          {
            find: /^@vireocodedev\/starter-localization$/,
            replacement: resolve(__dirname, "../../localization/src/index.ts"),
          },
          {
            find: /^@vireocodedev\/starter-ui\/event-source$/,
            replacement: resolve(__dirname, "../src/integrations/event-source/public.ts"),
          },
          {
            find: /^@vireocodedev\/starter-ui\/country$/,
            replacement: resolve(__dirname, "../src/capabilities/country/public.ts"),
          },
          {
            find: /^@vireocodedev\/starter-ui\/forms$/,
            replacement: resolve(__dirname, "../src/capabilities/forms/public.ts"),
          },
          {
            find: /^@vireocodedev\/starter-ui\/storybook\/VireoDockedSidePanel$/,
            replacement: resolve(__dirname, "../storybook/VireoDockedSidePanel/index.ts"),
          },
          {
            find: /^@vireocodedev\/starter-ui\/storybook\/VireoIconContainer$/,
            replacement: resolve(__dirname, "../storybook/VireoIconContainer/index.ts"),
          },
          {
            find: /^@vireocodedev\/starter-ui\/storybook\/VireoResponsiveOverlayFrame$/,
            replacement: resolve(__dirname, "../storybook/VireoResponsiveOverlayFrame/index.ts"),
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
          {
            find: /^@mui\/material$/,
            replacement: resolve(__dirname, "./mui-material.ts"),
          },
          {
            find: /^@mui\/x-date-pickers$/,
            replacement: resolve(__dirname, "./mui-x-date-pickers.ts"),
          },
        ],
      },
      build: {
        // Gzip reporting does not affect the generated static Storybook and is
        // redundant with deployment artifact analysis.
        reportCompressedSize: false,
      },
    });
  },
};

export default config;
