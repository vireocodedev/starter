import CustomizedSlotsExample from "@/core/components/inputs/VireoSelectInput/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/inputs/VireoSelectInput/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/inputs/VireoSelectInput/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/inputs/VireoSelectInput/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/inputs/VireoSelectInput/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/inputs/VireoSelectInput/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoSelectInput } from "./VireoSelectInput";

function createSourceParameters(code: string) {
  return {
    docs: {
      source: {
        code,
        language: "tsx",
        type: "code" as const,
      },
    },
  };
}

const meta = {
  title: "Core/Inputs/VireoSelectInput",
  component: VireoSelectInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoSelectInput provides a clearable, option-driven single-select field with consistent validation anatomy.

### Why it exists

Single-select fields otherwise repeat option lookup, placeholder rendering, clear behavior, and helper-text wiring. Vireo owns that recurring contract so forms share accessible behavior and customization slots. Use it for string- or number-valued option lists; use MUI Select directly for native-select behavior or highly specialized menu composition.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  args: { value: null, onChange: () => undefined, options: [], getOptionValue: () => "", renderOption: () => null },
} satisfies Meta<typeof VireoSelectInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: createSourceParameters(customizedSlotsExampleSource),
};

export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: createSourceParameters(themeCustomizationExampleSource),
};
