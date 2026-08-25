import DefaultExample from "@/capabilities/forms/components/forms/VireoFormNumberField/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormNumberField/internal/storybook/DefaultExample.tsx?raw";
import ZodFieldValidationExample from "@/capabilities/forms/components/forms/VireoFormNumberField/internal/storybook/ZodFieldValidationExample";
import zodFieldValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormNumberField/internal/storybook/ZodFieldValidationExample.tsx?raw";
import ZodFormValidationExample from "@/capabilities/forms/components/forms/VireoFormNumberField/internal/storybook/ZodFormValidationExample";
import zodFormValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormNumberField/internal/storybook/ZodFormValidationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormNumberField } from "./VireoFormNumberField";

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
  title: "TypeScript/UI/Capabilities/Forms/Fields/VireoFormNumberField",
  component: VireoFormNumberField,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormNumberField binds MUI TextField anatomy to the current TanStack Form \`number | null\` field through \`field.NumberField\`.

### Why it exists

Numeric entry otherwise forces every form to reconcile editable text with typed values, incomplete decimal drafts, locale decimal commas, nullability, bounds, validation visibility, accessibility, and submission state. Vireo centralizes that plumbing while preserving MUI's slots, slot props, styling, and variants. Use it for ordinary decimal or integer fields created by \`useVireoForm\`; use a specialized control when the domain needs stepping, units, currency formatting, or arbitrary-precision values.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormNumberField>;

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
    "Passes a Zod number schema directly to the field validator while the bound input continues to edit a number-or-null value.",
  ),
};

export const ZodFormValidation: Story = {
  render: () => <ZodFormValidationExample />,
  parameters: createSourceParameters(
    zodFormValidationExampleSource,
    "Passes one Zod object schema to useVireoForm so numeric and text issues reach their matching fields without repeated field-level schemas.",
  ),
};
