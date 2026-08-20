import CustomizedSlotsExample from "@/capabilities/forms/components/forms/VireoFormSubmitButton/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/capabilities/forms/components/forms/VireoFormSubmitButton/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/forms/VireoFormSubmitButton/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormSubmitButton/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/forms/components/forms/VireoFormSubmitButton/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/capabilities/forms/components/forms/VireoFormSubmitButton/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormSubmitButton } from "./VireoFormSubmitButton";

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
  title: "Forms/Forms/VireoFormSubmitButton",
  component: VireoFormSubmitButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `Submits a Vireo form and reflects its asynchronous submission lifecycle as a loading button.

### Why it exists

Form submit actions repeatedly need the same native semantics, pending-state subscription, duplicate-submission protection, and MUI loading presentation. Vireo owns that wiring so consumers do not manually mirror form state into every submit button. Obtain it from \`useVireoForm\` as \`form.SubmitButton\`; use a normal button when the action does not submit that form.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormSubmitButton>;

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
