import CustomizedSlotsExample from "@/core/components/inputs/VireoTimeInput/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/inputs/VireoTimeInput/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/inputs/VireoTimeInput/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/inputs/VireoTimeInput/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/inputs/VireoTimeInput/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/inputs/VireoTimeInput/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoTimeInput } from "./VireoTimeInput";

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
  title: "Core/Inputs/VireoTimeInput",
  component: VireoTimeInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoTimeInput edits a time of day while preserving timestamp-based application state.

### Why it exists

Time fields otherwise repeat timestamp conversion, view formatting, validation wiring, and cross-midnight reference-date correction. Vireo owns those conventions so scheduling forms share one boundary policy. Use it when time edits belong to a timestamp; use MUI TimePicker directly for standalone Dayjs time values.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  args: { value: null, onChange: () => undefined },
} satisfies Meta<typeof VireoTimeInput>;

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
