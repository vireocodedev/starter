import CustomizedSlotsExample from "@/core/components/inputs/VireoSwitchInput/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/inputs/VireoSwitchInput/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/inputs/VireoSwitchInput/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/inputs/VireoSwitchInput/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/inputs/VireoSwitchInput/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/inputs/VireoSwitchInput/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoSwitchInput } from "./VireoSwitchInput";

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
  title: "Core/Inputs/VireoSwitchInput",
  component: VireoSwitchInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `Provides a controlled boolean switch with consistent label and validation anatomy.

### Why it exists

Settings forms repeatedly combine a switch with a persistent label, helper text, and error state. Vireo owns that complete field anatomy and direct boolean callback. Use it for an immediately applied on/off setting; use a checkbox when users confirm several independent selections together.`,
      },
    },
  },
  args: { value: false, onChange: () => undefined },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoSwitchInput>;

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
