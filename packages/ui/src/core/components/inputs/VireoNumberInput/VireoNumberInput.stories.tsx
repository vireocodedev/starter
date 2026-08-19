import CustomizedSlotsExample from "@/core/components/inputs/VireoNumberInput/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/inputs/VireoNumberInput/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/inputs/VireoNumberInput/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/inputs/VireoNumberInput/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/inputs/VireoNumberInput/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/inputs/VireoNumberInput/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoNumberInput } from "./VireoNumberInput";

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
  title: "Core/Inputs/VireoNumberInput",
  component: VireoNumberInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `Provides a controlled numeric text field that safely handles partial decimal editing and bounds.

### Why it exists

Numeric forms need users to type intermediate states such as a minus sign or decimal separator without leaking invalid numbers into application state. Vireo owns parsing, comma normalization, null handling, and bounds. Use it when a precise typed value matters; use a slider when relative adjustment is the primary interaction.`,
      },
    },
  },
  args: { value: null, onChange: () => undefined },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoNumberInput>;

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
