import CustomizedSlotsExample from "@/core/components/inputs/VireoDurationInput/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/inputs/VireoDurationInput/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/inputs/VireoDurationInput/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/inputs/VireoDurationInput/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/inputs/VireoDurationInput/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/inputs/VireoDurationInput/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoDurationInput } from "./VireoDurationInput";

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
  title: "Core/Inputs/VireoDurationInput",
  component: VireoDurationInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoDurationInput edits a numeric duration through a familiar clock-shaped field.

### Why it exists

Duration fields otherwise repeat unit conversion, view formatting, validation wiring, and adornment handling. Vireo owns those conventions so consumers keep numeric duration state without leaking Dayjs. Use it for bounded clock-like durations; use an ordinary numeric input for unbounded or very large durations.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  args: { value: null, onChange: () => undefined },
} satisfies Meta<typeof VireoDurationInput>;

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
