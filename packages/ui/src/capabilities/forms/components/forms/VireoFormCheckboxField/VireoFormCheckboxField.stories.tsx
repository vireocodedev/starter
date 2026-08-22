import DefaultExample from "@/capabilities/forms/components/forms/VireoFormCheckboxField/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormCheckboxField/internal/storybook/DefaultExample.tsx?raw";
import ZodFieldValidationExample from "@/capabilities/forms/components/forms/VireoFormCheckboxField/internal/storybook/ZodFieldValidationExample";
import zodFieldValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormCheckboxField/internal/storybook/ZodFieldValidationExample.tsx?raw";
import ZodFormValidationExample from "@/capabilities/forms/components/forms/VireoFormCheckboxField/internal/storybook/ZodFormValidationExample";
import zodFormValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormCheckboxField/internal/storybook/ZodFormValidationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormCheckboxField } from "./VireoFormCheckboxField";

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
  title: "UI/Capabilities/Forms/Fields/VireoFormCheckboxField",
  component: VireoFormCheckboxField,
  tags: ["autodocs"],
  args: { label: "Preference" },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormCheckboxField binds a labelled MUI Checkbox to the current TanStack Form boolean field through \`field.CheckboxField\`.

### Why it exists

Checkbox fields otherwise repeat checked-state mapping, change and blur wiring, validation visibility, error formatting, accessible labels, helper-text relationships, and submission state in every form. Vireo centralizes that plumbing while preserving MUI slots, slot props, label placement, styling, and theming. Use it for acknowledgements, optional selections, and boolean choices created by \`useVireoForm\`; use \`field.SwitchField\` when changing the value represents an immediate setting toggle.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormCheckboxField>;

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
    "Passes a Zod boolean refinement directly to the field validator for a required acknowledgement.",
  ),
};

export const ZodFormValidation: Story = {
  render: () => <ZodFormValidationExample />,
  parameters: createSourceParameters(
    zodFormValidationExampleSource,
    "Passes one Zod object schema to useVireoForm so text and boolean issues reach their matching fields without repeated field schemas.",
  ),
};
