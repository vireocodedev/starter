import CustomizedSlotsExample from "@/core/components/inputs/VireoSelectMultipleInput/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/inputs/VireoSelectMultipleInput/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/inputs/VireoSelectMultipleInput/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/inputs/VireoSelectMultipleInput/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/inputs/VireoSelectMultipleInput/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/inputs/VireoSelectMultipleInput/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoSelectMultipleInput } from "./VireoSelectMultipleInput";

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
  title: "Core/Inputs/VireoSelectMultipleInput",
  component: VireoSelectMultipleInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoSelectMultipleInput provides an option-driven multiple-select field with checked menu items and validation anatomy.

### Why it exists

Multiple-select fields otherwise repeat option lookup, selected-value rendering, checked menu rows, and helper-text wiring. Vireo owns that recurring contract so forms share behavior and customization slots. Use it for compact string- or number-valued lists; prefer autocomplete when option discovery needs search.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  args: { value: [], onChange: () => undefined, options: [], getOptionValue: () => "", renderOption: () => null },
} satisfies Meta<typeof VireoSelectMultipleInput>;

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
