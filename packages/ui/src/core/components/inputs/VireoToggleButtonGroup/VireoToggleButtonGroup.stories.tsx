import CustomizedSlotsExample from "@/core/components/inputs/VireoToggleButtonGroup/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/inputs/VireoToggleButtonGroup/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/inputs/VireoToggleButtonGroup/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/inputs/VireoToggleButtonGroup/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/inputs/VireoToggleButtonGroup/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/inputs/VireoToggleButtonGroup/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoToggleButtonGroup } from "./VireoToggleButtonGroup";

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
  title: "Core/Inputs/VireoToggleButtonGroup",
  component: VireoToggleButtonGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `Provides controlled single- or multi-select choices as a compact toggle-button field.

### Why it exists

Compact filters and settings need consistent selection, clearing, validation, option rendering, and multiple-selection behavior. Vireo owns that field contract without prescribing the option model. Use it for a short visible set of peer choices; use a select or autocomplete when choices are numerous.`,
      },
    },
  },
  args: {
    options: [],
    renderOption: value => String(value),
    renderKey: value => String(value),
    value: null,
    onChange: () => undefined,
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoToggleButtonGroup>;

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
