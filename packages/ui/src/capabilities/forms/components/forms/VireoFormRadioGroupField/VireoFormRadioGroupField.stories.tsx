import DefaultExample from "@/capabilities/forms/components/forms/VireoFormRadioGroupField/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormRadioGroupField/internal/storybook/DefaultExample.tsx?raw";
import ZodFieldValidationExample from "@/capabilities/forms/components/forms/VireoFormRadioGroupField/internal/storybook/ZodFieldValidationExample";
import zodFieldValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormRadioGroupField/internal/storybook/ZodFieldValidationExample.tsx?raw";
import ZodFormValidationExample from "@/capabilities/forms/components/forms/VireoFormRadioGroupField/internal/storybook/ZodFormValidationExample";
import zodFormValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormRadioGroupField/internal/storybook/ZodFormValidationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormRadioGroupField } from "./VireoFormRadioGroupField";

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
  title: "TypeScript/UI/Capabilities/Forms/Fields/VireoFormRadioGroupField",
  component: VireoFormRadioGroupField,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormRadioGroupField binds typed scalar radio options to the current TanStack Form field through \`field.RadioGroupField\`.

### Why it exists

Radio groups otherwise repeat scalar option mapping, checked-state lookup, change and blur wiring, disabled-option handling, validation visibility, helper-text accessibility, and submission state in every form. Vireo centralizes that plumbing while preserving MUI slots, slot props, layout, styling, and theming. Use it for a short visible set of mutually exclusive string or number choices created by \`useVireoForm\`; use \`field.SelectField\` when the choices should remain collapsed or an autocomplete for large or searchable collections.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  args: {
    "aria-label": "Selection",
    options: [],
    getOptionValue: () => "",
    renderOption: () => null,
  },
} satisfies Meta<typeof VireoFormRadioGroupField>;

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
    "Passes a nullable Zod enum directly to the field validator and requires one notification channel.",
  ),
};

export const ZodFormValidation: Story = {
  render: () => <ZodFormValidationExample />,
  parameters: createSourceParameters(
    zodFormValidationExampleSource,
    "Passes one Zod object schema to useVireoForm so text and numeric radio-group issues reach their matching fields without repeated field schemas.",
  ),
};
