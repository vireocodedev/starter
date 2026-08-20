import CustomizedSlotsExample from "@/capabilities/forms/components/forms/VireoFormActions/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/capabilities/forms/components/forms/VireoFormActions/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/forms/VireoFormActions/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormActions/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/forms/components/forms/VireoFormActions/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/capabilities/forms/components/forms/VireoFormActions/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormActions } from "./VireoFormActions";

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
  title: "Forms/Forms/VireoFormActions",
  component: VireoFormActions,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoFormActions arranges secondary and primary form actions according to the width of their containing surface.

### Why it exists

Forms otherwise repeat action ordering, spacing, alignment, mobile stacking, and full-width button rules in every page, dialog, and drawer. Vireo owns that responsive action layout so the same action list adapts to its actual container rather than the viewport. Use it for form-level actions; use an ordinary button group for unrelated commands.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  args: { children: "Form actions" },
} satisfies Meta<typeof VireoFormActions>;

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
