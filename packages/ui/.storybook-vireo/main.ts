import type { StorybookConfig } from "@storybook/react-vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";
import { vireoStorybookMatrixStories } from "./testing/storybook-matrix-stories.ts";

const storybookDirectory = import.meta.dirname;
const addonDocsBlocksEntry = fileURLToPath(import.meta.resolve("@storybook/addon-docs/blocks"));
const storybookProviderEntry =
  process.env.VIREO_STORYBOOK_CONTRACTS === "true"
    ? resolve(storybookDirectory, "./testing/storybook-entry.tsx")
    : resolve(storybookDirectory, "../storybook/index.ts");
const fullStorybookCorpus = [
  "../docs/storybook/**/*.mdx",
  "../../history/docs/storybook/**/*.mdx",
  "../../infrastructure/docs/storybook/**/*.mdx",
  "../../localization/docs/storybook/**/*.mdx",
  "../../queryengine/docs/storybook/**/*.mdx",
  "../../shell/docs/storybook/**/*.mdx",
  "../../sqlite/docs/storybook/**/*.mdx",
  "../../../jvm/docs/storybook/**/*.mdx",
  "../../../jvm/*/docs/storybook/**/*.mdx",
  "../src/**/{Vireo,useVireo}*.stories.@(js|jsx|mjs|ts|tsx)",
];
const executableStorybookCorpus = ["../src/**/{Vireo,useVireo}*.stories.@(js|jsx|mjs|ts|tsx)"];
const storybookStories =
  process.env.VIREO_STORYBOOK_MATRIX === "true"
    ? [...vireoStorybookMatrixStories]
    : process.env.VIREO_STORYBOOK_CONTRACTS === "true"
      ? executableStorybookCorpus
      : fullStorybookCorpus;

const config: StorybookConfig = {
  stories: storybookStories,
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
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
            find: /^@storybook\/addon-docs\/blocks$/,
            replacement: addonDocsBlocksEntry,
          },
          {
            find: /^@vireo-storybook\/documentation$/,
            replacement: resolve(storybookDirectory, "../storybook/documentation/index.ts"),
          },
          {
            find: /^@vireocodedev\/starter-history$/,
            replacement: resolve(storybookDirectory, "../../history/src/index.ts"),
          },
          {
            find: /^@vireocodedev\/starter-infrastructure$/,
            replacement: resolve(storybookDirectory, "../../infrastructure/src/index.ts"),
          },
          {
            find: /^@vireocodedev\/starter-infrastructure\/network-status$/,
            replacement: resolve(storybookDirectory, "../../infrastructure/src/network/appNetworkStatus.ts"),
          },
          {
            find: /^@vireocodedev\/starter-infrastructure\/pagination$/,
            replacement: resolve(storybookDirectory, "../../infrastructure/src/http/pagination.ts"),
          },
          {
            find: /^@vireocodedev\/starter-localization$/,
            replacement: resolve(storybookDirectory, "../../localization/src/index.ts"),
          },
          {
            find: /^@vireocodedev\/starter-queryengine$/,
            replacement: resolve(storybookDirectory, "../../queryengine/src/index.ts"),
          },
          {
            find: /^@vireocodedev\/starter-shell$/,
            replacement: resolve(storybookDirectory, "../../shell/src/index.ts"),
          },
          {
            find: /^@vireocodedev\/starter-sqlite\/offline$/,
            replacement: resolve(storybookDirectory, "../../sqlite/src/offline/index.ts"),
          },
          {
            find: /^@vireocodedev\/starter-sqlite$/,
            replacement: resolve(storybookDirectory, "../../sqlite/src/index.ts"),
          },
          {
            find: /^@vireocodedev\/starter-ui\/event-source$/,
            replacement: resolve(storybookDirectory, "../src/integrations/event-source/public.ts"),
          },
          {
            find: /^@vireocodedev\/starter-ui\/country$/,
            replacement: resolve(storybookDirectory, "../src/capabilities/country/public.ts"),
          },
          {
            find: /^@vireocodedev\/starter-ui\/forms$/,
            replacement: resolve(storybookDirectory, "../src/capabilities/forms/public.ts"),
          },
          {
            find: /^@vireocodedev\/starter-ui\/storybook\/VireoDockedSidePanel$/,
            replacement: resolve(storybookDirectory, "../storybook/VireoDockedSidePanel/index.ts"),
          },
          {
            find: /^@vireocodedev\/starter-ui\/storybook\/VireoIconContainer$/,
            replacement: resolve(storybookDirectory, "../storybook/VireoIconContainer/index.ts"),
          },
          {
            find: /^@vireocodedev\/starter-ui\/storybook\/VireoResponsiveOverlayFrame$/,
            replacement: resolve(storybookDirectory, "../storybook/VireoResponsiveOverlayFrame/index.ts"),
          },
          {
            find: /^@vireocodedev\/ui\/storybook$/,
            replacement: storybookProviderEntry,
          },
          {
            find: /^@vireocodedev\/ui\/theme$/,
            replacement: resolve(storybookDirectory, "../src/core/utils/themeutils.ts"),
          },
          {
            find: /^@vireocodedev\/starter-ui\/storybook$/,
            replacement: storybookProviderEntry,
          },
          {
            find: /^@vireocodedev\/starter-ui$/,
            replacement: resolve(storybookDirectory, "./starter-ui-entry.ts"),
          },
          { find: "@", replacement: resolve(storybookDirectory, "../src") },
          {
            find: /^@mui\/icons-material$/,
            replacement: resolve(storybookDirectory, "./mui-icons.ts"),
          },
          {
            find: /^@mui\/material$/,
            replacement: resolve(storybookDirectory, "./mui-material.ts"),
          },
          {
            find: /^@mui\/x-date-pickers$/,
            replacement: resolve(storybookDirectory, "./mui-x-date-pickers.ts"),
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
