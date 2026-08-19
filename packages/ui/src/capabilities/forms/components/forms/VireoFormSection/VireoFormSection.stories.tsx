import CustomizedSlotsExample from "@/capabilities/forms/components/forms/VireoFormSection/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/capabilities/forms/components/forms/VireoFormSection/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/forms/VireoFormSection/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormSection/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/forms/components/forms/VireoFormSection/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/capabilities/forms/components/forms/VireoFormSection/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormSection } from "./VireoFormSection";

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
  title: "Forms/Forms/VireoFormSection",
  component: VireoFormSection,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `Groups related form controls under an optional accessible heading and consistent surface.

### Why it exists

Complex forms repeatedly need a clear hierarchy, a labelled group relationship, and shared spacing and surface treatment around related controls. The forms capability owns that composition. Use it for meaningful groups within a form; avoid it for a single field or purely decorative cards.`,
      },
    },
  },
  args: { children: "Form controls" },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormSection>;

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
