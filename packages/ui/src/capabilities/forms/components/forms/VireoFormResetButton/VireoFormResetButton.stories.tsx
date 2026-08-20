import CustomizedSlotsExample from "@/capabilities/forms/components/forms/VireoFormResetButton/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/capabilities/forms/components/forms/VireoFormResetButton/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/forms/VireoFormResetButton/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormResetButton/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/forms/components/forms/VireoFormResetButton/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/capabilities/forms/components/forms/VireoFormResetButton/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormResetButton } from "./VireoFormResetButton";

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
  title: "Forms/Forms/VireoFormResetButton",
  component: VireoFormResetButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `Resets a Vireo form to its default values and stays unavailable while the form is pristine.

### Why it exists

Reset actions repeatedly need native form semantics, dirtiness subscription, and consistent pristine-state disabling. Vireo owns that wiring so consumers cannot accidentally offer a no-op reset or duplicate state selectors. Obtain it from \`useVireoForm\` as \`form.ResetButton\`; use a normal button when the action performs a different restoration workflow.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormResetButton>;

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
