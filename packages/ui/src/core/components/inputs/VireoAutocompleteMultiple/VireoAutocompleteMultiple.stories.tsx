import CustomizedSlotsExample from "@/core/components/inputs/VireoAutocompleteMultiple/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/inputs/VireoAutocompleteMultiple/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/inputs/VireoAutocompleteMultiple/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/inputs/VireoAutocompleteMultiple/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/inputs/VireoAutocompleteMultiple/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/inputs/VireoAutocompleteMultiple/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoAutocompleteMultiple } from "./VireoAutocompleteMultiple";

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
  title: "Core/Inputs/VireoAutocompleteMultiple",
  component: VireoAutocompleteMultiple,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoAutocompleteMultiple provides controlled multiple-option search with static or asynchronously resolved options.

### Why it exists

Multi-value autocomplete fields otherwise repeat controlled search state, async loading, selected-option merging, and validation wiring. Vireo owns that shared behavior so consumers can switch option sources without rebuilding the field. Use it for searchable multi-selection; use a multiple select for short compact lists.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  args: {
    value: [],
    onChange: () => undefined,
    options: [],
    getOptionLabel: () => "",
    isOptionEqualToValue: () => false,
  },
} satisfies Meta<typeof VireoAutocompleteMultiple>;

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
