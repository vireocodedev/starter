import CustomizedSlotsExample from "@/core/components/inputs/VireoFreeSoloAutocomplete/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/inputs/VireoFreeSoloAutocomplete/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/inputs/VireoFreeSoloAutocomplete/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/inputs/VireoFreeSoloAutocomplete/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/inputs/VireoFreeSoloAutocomplete/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/inputs/VireoFreeSoloAutocomplete/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFreeSoloAutocomplete } from "./VireoFreeSoloAutocomplete";

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
  title: "Core/Inputs/VireoFreeSoloAutocomplete",
  component: VireoFreeSoloAutocomplete,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoFreeSoloAutocomplete combines known-option search with an explicit action for persisting arbitrary text.

### Why it exists

Free-solo fields otherwise repeat synthetic-option mapping, string persistence, and an accessible add-value menu action. Vireo owns that boundary so consumers retain typed option models without losing custom text. Use it when both known and user-created values are valid; use VireoAutocomplete when values must come from the option set.`,
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
    getStringValue: () => null,
    createSyntheticOption: value => value,
    addLabel: value => value,
  },
} satisfies Meta<typeof VireoFreeSoloAutocomplete>;

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
