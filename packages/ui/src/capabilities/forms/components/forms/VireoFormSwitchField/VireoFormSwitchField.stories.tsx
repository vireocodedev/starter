import DefaultExample from "@/capabilities/forms/components/forms/VireoFormSwitchField/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormSwitchField/internal/storybook/DefaultExample.tsx?raw";
import ZodFieldValidationExample from "@/capabilities/forms/components/forms/VireoFormSwitchField/internal/storybook/ZodFieldValidationExample";
import zodFieldValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormSwitchField/internal/storybook/ZodFieldValidationExample.tsx?raw";
import ZodFormValidationExample from "@/capabilities/forms/components/forms/VireoFormSwitchField/internal/storybook/ZodFormValidationExample";
import zodFormValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormSwitchField/internal/storybook/ZodFormValidationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormSwitchField } from "./VireoFormSwitchField";

function createSourceParameters(code: string, description?: string) {
  return {
    docs: {
      ...(description && { description: { story: description } }),
      source: {
        code,
        language: "tsx",
        type: "code" as const,
      },
    },
  };
}

const meta = {
  title: "Forms/Forms/Fields/VireoFormSwitchField",
  component: VireoFormSwitchField,
  tags: ["autodocs"],
  args: { label: "Preference" },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormSwitchField binds a labelled MUI Switch to the current TanStack Form boolean field through \`field.SwitchField\`.

### Why it exists

Boolean fields otherwise repeat checked-state mapping, change and blur wiring, validation visibility, error formatting, accessible labels, helper-text relationships, and submission state in every form. Vireo centralizes that plumbing while preserving MUI slots, slot props, label placement, styling, and theming. Use it for independent true-or-false settings created by \`useVireoForm\`; use checkboxes for multi-selection or acknowledgement patterns whose visual meaning is not an immediate setting toggle.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormSwitchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const ZodFieldValidation: Story = {
  render: () => <ZodFieldValidationExample />,
  parameters: createSourceParameters(
    zodFieldValidationExampleSource,
    "Passes a Zod boolean refinement directly to the field validator for a required enabled state.",
  ),
};

export const ZodFormValidation: Story = {
  render: () => <ZodFormValidationExample />,
  parameters: createSourceParameters(
    zodFormValidationExampleSource,
    "Passes one Zod object schema to useVireoForm so text and boolean issues reach their matching fields without repeated field schemas.",
  ),
};
