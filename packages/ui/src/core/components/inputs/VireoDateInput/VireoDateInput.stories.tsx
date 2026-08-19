import CustomizedSlotsExample from "@/core/components/inputs/VireoDateInput/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/inputs/VireoDateInput/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/inputs/VireoDateInput/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/inputs/VireoDateInput/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/inputs/VireoDateInput/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/inputs/VireoDateInput/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoDateInput } from "./VireoDateInput";

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
  title: "Core/Inputs/VireoDateInput",
  component: VireoDateInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoDateInput edits an optional calendar date while keeping application state as a millisecond timestamp.

### Why it exists

Date pickers otherwise repeat timestamp conversion, validation wiring, full-width field behavior, and first-selection time normalization. Vireo owns those conventions so forms exchange one stable value shape. Use it for timestamp-backed dates; use MUI DatePicker directly when the application stores Dayjs values or requires a substantially different conversion policy.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  args: { value: null, onChange: () => undefined },
} satisfies Meta<typeof VireoDateInput>;

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
