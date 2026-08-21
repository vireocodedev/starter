import CustomizedSlotsExample from "@/capabilities/country/components/data-display/VireoCountryFlag/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/capabilities/country/components/data-display/VireoCountryFlag/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/country/components/data-display/VireoCountryFlag/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/country/components/data-display/VireoCountryFlag/internal/storybook/DefaultExample.tsx?raw";
import FlagRegistryExample from "@/capabilities/country/components/data-display/VireoCountryFlag/internal/storybook/FlagRegistryExample";
import flagRegistryExampleSource from "@/capabilities/country/components/data-display/VireoCountryFlag/internal/storybook/FlagRegistryExample.tsx?raw";
import LocalizedNamesExample from "@/capabilities/country/components/data-display/VireoCountryFlag/internal/storybook/LocalizedNamesExample";
import localizedNamesExampleSource from "@/capabilities/country/components/data-display/VireoCountryFlag/internal/storybook/LocalizedNamesExample.tsx?raw";
import SizingExample from "@/capabilities/country/components/data-display/VireoCountryFlag/internal/storybook/SizingExample";
import sizingExampleSource from "@/capabilities/country/components/data-display/VireoCountryFlag/internal/storybook/SizingExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/country/components/data-display/VireoCountryFlag/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/capabilities/country/components/data-display/VireoCountryFlag/internal/storybook/ThemeCustomizationExample.tsx?raw";
import TooltipsExample from "@/capabilities/country/components/data-display/VireoCountryFlag/internal/storybook/TooltipsExample";
import tooltipsExampleSource from "@/capabilities/country/components/data-display/VireoCountryFlag/internal/storybook/TooltipsExample.tsx?raw";
import UnknownCodesExample from "@/capabilities/country/components/data-display/VireoCountryFlag/internal/storybook/UnknownCodesExample";
import unknownCodesExampleSource from "@/capabilities/country/components/data-display/VireoCountryFlag/internal/storybook/UnknownCodesExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoCountryFlag } from "./VireoCountryFlag";

function createSourceParameters(code: string, description?: string) {
  return {
    docs: {
      ...(description && { description: { story: description } }),
      source: { code, language: "tsx", type: "code" as const },
    },
  };
}

const meta = {
  title: "Country/Data Display/VireoCountryFlag",
  component: VireoCountryFlag,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoCountryFlag renders any country-flag-icons registry identifier through a consistent, accessible 3:2 flag surface with a themed unknown-code fallback.

### Why it exists

Country flags recur in country references, regional settings, locale indicators, and read-only summaries. Directly importing flag assets repeatedly scatters runtime code lookup, subdivision identifier handling, sizing, framing, accessibility, tooltip behavior, and unknown-code presentation. Vireo centralizes that behavior while \`getCountryName\` provides localization-independent display names. Use it to present a flag associated with a country or territory code, preferably beside visible text. Do not use a flag as the sole representation of nationality, citizenship, language, or a country-selection workflow.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  args: { countryCode: "HR" },
} satisfies Meta<typeof VireoCountryFlag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const FlagRegistry: Story = {
  render: () => <FlagRegistryExample />,
  parameters: createSourceParameters(
    flagRegistryExampleSource,
    "Renders all 265 identifiers from the pinned upstream registry.",
  ),
};

export const UnknownCodes: Story = {
  render: () => <UnknownCodesExample />,
  parameters: createSourceParameters(unknownCodesExampleSource),
};

export const Tooltips: Story = {
  render: () => <TooltipsExample />,
  parameters: createSourceParameters(tooltipsExampleSource),
};

export const Sizing: Story = {
  render: () => <SizingExample />,
  parameters: createSourceParameters(sizingExampleSource),
};

export const LocalizedNames: Story = {
  render: () => <LocalizedNamesExample />,
  parameters: createSourceParameters(localizedNamesExampleSource),
};

export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: createSourceParameters(customizedSlotsExampleSource),
};

export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: createSourceParameters(themeCustomizationExampleSource),
};
