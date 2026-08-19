import CustomizedSlotsExample from "@/core/components/inputs/VireoSliderInput/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/inputs/VireoSliderInput/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/inputs/VireoSliderInput/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/inputs/VireoSliderInput/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/inputs/VireoSliderInput/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/inputs/VireoSliderInput/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoSliderInput } from "./VireoSliderInput";

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
  title: "Core/Inputs/VireoSliderInput",
  component: VireoSliderInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `Combines continuous slider adjustment with a precise controlled numeric field.

### Why it exists

Thresholds and tuning controls often need fast relative movement and exact typed values while sharing bounds, disabled state, adornments, and validation. Vireo owns that synchronized compound field. Use it when both interaction modes are valuable; use a plain slider or number input when only one is needed.`,
      },
    },
  },
  args: { value: 0, onChange: () => undefined, min: 0, max: 100, step: 1 },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoSliderInput>;

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
