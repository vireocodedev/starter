import CustomizedSlotsExample from "@/core/components/inputs/VireoTextInput/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/inputs/VireoTextInput/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/inputs/VireoTextInput/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/inputs/VireoTextInput/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/inputs/VireoTextInput/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/inputs/VireoTextInput/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoTextInput } from "./VireoTextInput";

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
  title: "Core/Inputs/VireoTextInput",
  component: VireoTextInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `Provides a controlled text field whose change callback receives the next string directly.

### Why it exists

Forms repeatedly need the same value-level contract while retaining MUI labels, validation, helper text, and theme customization. Vireo owns that small adapter so consumers and form controllers do not unpack DOM events. Use it for ordinary single-line text; use a textarea or specialized input when the value has richer semantics.`,
      },
    },
  },
  args: { value: "", onChange: () => undefined },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoTextInput>;

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
