import CustomizedSlotsExample from "@/core/components/inputs/VireoDateTimeInput/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/inputs/VireoDateTimeInput/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/inputs/VireoDateTimeInput/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/inputs/VireoDateTimeInput/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/inputs/VireoDateTimeInput/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/inputs/VireoDateTimeInput/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoDateTimeInput } from "./VireoDateTimeInput";

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
  title: "Core/Inputs/VireoDateTimeInput",
  component: VireoDateTimeInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoDateTimeInput edits an optional date and time while keeping application state as a millisecond timestamp.

### Why it exists

Date-time fields otherwise repeat timestamp conversion, validation wiring, and initial time normalization. Vireo owns those conventions so forms exchange one stable value shape. Use it for timestamp-backed date-times; use MUI DateTimePicker directly when the application stores Dayjs values or requires a different conversion policy.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  args: { value: null, onChange: () => undefined },
} satisfies Meta<typeof VireoDateTimeInput>;

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
