import AdapterLocaleOverrideExample from "@/integrations/localization/providers/VireoTemporalLocalizationProvider/internal/storybook/AdapterLocaleOverrideExample";
import adapterLocaleOverrideExampleSource from "@/integrations/localization/providers/VireoTemporalLocalizationProvider/internal/storybook/AdapterLocaleOverrideExample.tsx?raw";
import CroatianLocaleExample from "@/integrations/localization/providers/VireoTemporalLocalizationProvider/internal/storybook/CroatianLocaleExample";
import croatianLocaleExampleSource from "@/integrations/localization/providers/VireoTemporalLocalizationProvider/internal/storybook/CroatianLocaleExample.tsx?raw";
import CustomFormatsAndLocaleTextExample from "@/integrations/localization/providers/VireoTemporalLocalizationProvider/internal/storybook/CustomFormatsAndLocaleTextExample";
import customFormatsAndLocaleTextExampleSource from "@/integrations/localization/providers/VireoTemporalLocalizationProvider/internal/storybook/CustomFormatsAndLocaleTextExample.tsx?raw";
import DefaultExample from "@/integrations/localization/providers/VireoTemporalLocalizationProvider/internal/storybook/DefaultExample";
import defaultExampleSource from "@/integrations/localization/providers/VireoTemporalLocalizationProvider/internal/storybook/DefaultExample.tsx?raw";
import NestedLocalesExample from "@/integrations/localization/providers/VireoTemporalLocalizationProvider/internal/storybook/NestedLocalesExample";
import nestedLocalesExampleSource from "@/integrations/localization/providers/VireoTemporalLocalizationProvider/internal/storybook/NestedLocalesExample.tsx?raw";
import RegionalLocaleExample from "@/integrations/localization/providers/VireoTemporalLocalizationProvider/internal/storybook/RegionalLocaleExample";
import regionalLocaleExampleSource from "@/integrations/localization/providers/VireoTemporalLocalizationProvider/internal/storybook/RegionalLocaleExample.tsx?raw";
import RuntimeLocaleChangeExample from "@/integrations/localization/providers/VireoTemporalLocalizationProvider/internal/storybook/RuntimeLocaleChangeExample";
import runtimeLocaleChangeExampleSource from "@/integrations/localization/providers/VireoTemporalLocalizationProvider/internal/storybook/RuntimeLocaleChangeExample.tsx?raw";
import UnsupportedLocaleFallbackExample from "@/integrations/localization/providers/VireoTemporalLocalizationProvider/internal/storybook/UnsupportedLocaleFallbackExample";
import unsupportedLocaleFallbackExampleSource from "@/integrations/localization/providers/VireoTemporalLocalizationProvider/internal/storybook/UnsupportedLocaleFallbackExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoTemporalLocalizationProvider } from "./VireoTemporalLocalizationProvider";

function source(code: string, description?: string) {
  return {
    docs: {
      ...(description && { description: { story: description } }),
      source: { code, language: "tsx", type: "code" as const },
    },
  };
}

const meta = {
  title: "Integrations/Localization/VireoTemporalLocalizationProvider",
  component: VireoTemporalLocalizationProvider,
  tags: ["autodocs"],
  args: { children: null, locale: "en" },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoTemporalLocalizationProvider supplies an explicit Day.js and MUI X localization scope for Vireo temporal fields.

### Why it exists

Temporal inputs otherwise repeat adapter setup, locale fallback, picker-text selection, and format overrides while accidentally coupling UI to an application's translation runtime. Vireo owns this narrow localization boundary so locale changes remain scoped and synchronous. Use it around every \`field.TemporalField\` tree; keep application translation resources and timezone policy outside it.`,
      },
    },
  },
} satisfies Meta<typeof VireoTemporalLocalizationProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <DefaultExample />, parameters: source(defaultExampleSource) };
export const CroatianLocale: Story = {
  render: () => <CroatianLocaleExample />,
  parameters: source(croatianLocaleExampleSource),
};
export const RegionalLocale: Story = {
  render: () => <RegionalLocaleExample />,
  parameters: source(regionalLocaleExampleSource),
};
export const AdapterLocaleOverride: Story = {
  render: () => <AdapterLocaleOverrideExample />,
  parameters: source(
    adapterLocaleOverrideExampleSource,
    "Maps a semantic locale to a differently named consumer-registered Day.js locale pack.",
  ),
};
export const CustomFormatsAndLocaleText: Story = {
  render: () => <CustomFormatsAndLocaleTextExample />,
  parameters: source(customFormatsAndLocaleTextExampleSource),
};
export const RuntimeLocaleChange: Story = {
  render: () => <RuntimeLocaleChangeExample />,
  parameters: source(runtimeLocaleChangeExampleSource, "Changes locale in place while preserving descendant state."),
};
export const NestedLocales: Story = {
  render: () => <NestedLocalesExample />,
  parameters: source(
    nestedLocalesExampleSource,
    "Uses the nearest provider without disturbing the outer localization scope.",
  ),
};
export const UnsupportedLocaleFallback: Story = {
  render: () => <UnsupportedLocaleFallbackExample />,
  parameters: source(
    unsupportedLocaleFallbackExampleSource,
    "Falls back to English when no matching registered Day.js locale exists.",
  ),
};
