import DefaultExample from "@/capabilities/forms/components/forms/VireoFormSelectField/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormSelectField/internal/storybook/DefaultExample.tsx?raw";
import ZodFieldValidationExample from "@/capabilities/forms/components/forms/VireoFormSelectField/internal/storybook/ZodFieldValidationExample";
import zodFieldValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormSelectField/internal/storybook/ZodFieldValidationExample.tsx?raw";
import ZodFormValidationExample from "@/capabilities/forms/components/forms/VireoFormSelectField/internal/storybook/ZodFormValidationExample";
import zodFormValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormSelectField/internal/storybook/ZodFormValidationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormSelectField } from "./VireoFormSelectField";

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
  title: "Forms/Forms/Fields/VireoFormSelectField",
  component: VireoFormSelectField,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormSelectField binds typed scalar options to the current TanStack Form field through \`field.SelectField\`.

### Why it exists

Select fields otherwise repeat nullable-value mapping, option lookup and rendering, clear behavior, change and blur wiring, validation visibility, helper-text accessibility, and submission state in every form. Vireo centralizes that plumbing while preserving MUI slots, slot props, variants, styling, and theming. Use it for one string- or number-valued choice created by \`useVireoForm\`; use an autocomplete for large or searchable collections and a dedicated multi-select field for array values.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  args: { label: "Selection", options: [], getOptionValue: () => "", renderOption: () => null },
} satisfies Meta<typeof VireoFormSelectField>;

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
    "Passes a nullable Zod enum directly to the field validator and requires one access role.",
  ),
};

export const ZodFormValidation: Story = {
  render: () => <ZodFormValidationExample />,
  parameters: createSourceParameters(
    zodFormValidationExampleSource,
    "Passes one Zod object schema to useVireoForm so text and select issues reach their matching fields without repeated field schemas.",
  ),
};
