import CustomizedSlotsExample from "@/core/components/inputs/VireoAutocomplete/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/inputs/VireoAutocomplete/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/inputs/VireoAutocomplete/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/inputs/VireoAutocomplete/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/inputs/VireoAutocomplete/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/inputs/VireoAutocomplete/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoAutocomplete } from "./VireoAutocomplete";

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
  title: "Core/Inputs/VireoAutocomplete",
  component: VireoAutocomplete,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoAutocomplete provides controlled single-option search with static or asynchronously resolved options.

### Why it exists

Autocomplete fields otherwise repeat controlled search state, async loading, option merging, sorting, and validation wiring. Vireo owns that shared behavior so consumers can switch between local and remote options without rebuilding the field. Use it for discoverable single selection; use a select for short, fully visible lists.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  args: {
    value: null,
    onChange: () => undefined,
    options: [],
    getOptionLabel: () => "",
    isOptionEqualToValue: () => false,
  },
} satisfies Meta<typeof VireoAutocomplete>;

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
