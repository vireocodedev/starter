import CustomizedSlotsExample from "@/core/components/inputs/VireoFreeSoloAutocompleteMultiple/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/inputs/VireoFreeSoloAutocompleteMultiple/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/inputs/VireoFreeSoloAutocompleteMultiple/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/inputs/VireoFreeSoloAutocompleteMultiple/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/inputs/VireoFreeSoloAutocompleteMultiple/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/inputs/VireoFreeSoloAutocompleteMultiple/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFreeSoloAutocompleteMultiple } from "./VireoFreeSoloAutocompleteMultiple";

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
  title: "Core/Inputs/VireoFreeSoloAutocompleteMultiple",
  component: VireoFreeSoloAutocompleteMultiple,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoFreeSoloAutocompleteMultiple combines multi-option search with an explicit action for adding arbitrary string values.

### Why it exists

Multi-value free-solo fields otherwise repeat synthetic-option mapping, duplicate prevention, string persistence, and add-value menu behavior. Vireo owns that boundary so consumers retain typed option models without losing custom values. Use it when users may choose several known or custom values; use VireoAutocompleteMultiple when every value must be predefined.`,
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
    getStringValue: () => null,
    createSyntheticOption: value => value,
    addLabel: value => value,
  },
} satisfies Meta<typeof VireoFreeSoloAutocompleteMultiple>;

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
