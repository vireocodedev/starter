import CustomizedSlotsExample from "@/capabilities/forms/components/data-display/VireoFormReadOnlyValue/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/capabilities/forms/components/data-display/VireoFormReadOnlyValue/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/data-display/VireoFormReadOnlyValue/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/data-display/VireoFormReadOnlyValue/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/forms/components/data-display/VireoFormReadOnlyValue/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/capabilities/forms/components/data-display/VireoFormReadOnlyValue/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormReadOnlyValue } from "./VireoFormReadOnlyValue";

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
  title: "TypeScript/UI/Capabilities/Forms/VireoFormReadOnlyValue",
  component: VireoFormReadOnlyValue,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    vireo: {
      loading: {
        categories: ["static"],
        geometry: null,
      },
    },
    docs: {
      description: {
        component: `VireoFormReadOnlyValue presents a form value without editable control chrome.

### Why it exists

Bound fields need one consistent read-only surface for normal, empty, and consumer-formatted values. Vireo owns the typography, empty-state styling, slots, and theme contract so fields can switch presentation without retaining input outlines, helper rows, or interaction affordances. Consumers normally receive it through \`form.Form readOnly\`; use it directly when building a custom bound field.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormReadOnlyValue>;

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
