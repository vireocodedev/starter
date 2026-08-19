import CustomizedSlotsExample from "@/core/components/inputs/VireoCounterInput/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/inputs/VireoCounterInput/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/inputs/VireoCounterInput/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/inputs/VireoCounterInput/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/inputs/VireoCounterInput/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/inputs/VireoCounterInput/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoCounterInput } from "./VireoCounterInput";

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
  title: "Core/Inputs/VireoCounterInput",
  component: VireoCounterInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `Combines direct numeric entry with bounded increment and decrement actions.

### Why it exists

Quantities often need both precise typing and quick one-step adjustment, with consistent range enforcement and accessible button labels. Vireo owns that compound interaction. Use it for small bounded counts such as seats or retries; use a plain number input for large or unbounded values.`,
      },
    },
  },
  args: { value: 1, onChange: () => undefined },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoCounterInput>;

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
