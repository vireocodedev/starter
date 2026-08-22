import DefaultExample from "@/capabilities/forms/components/forms/VireoFormTextField/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormTextField/internal/storybook/DefaultExample.tsx?raw";
import ZodFieldValidationExample from "@/capabilities/forms/components/forms/VireoFormTextField/internal/storybook/ZodFieldValidationExample";
import zodFieldValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormTextField/internal/storybook/ZodFieldValidationExample.tsx?raw";
import ZodFormValidationExample from "@/capabilities/forms/components/forms/VireoFormTextField/internal/storybook/ZodFormValidationExample";
import zodFormValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormTextField/internal/storybook/ZodFormValidationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormTextField } from "./VireoFormTextField";

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
  title: "Capabilities/Forms/Fields/VireoFormTextField",
  component: VireoFormTextField,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormTextField binds MUI TextField anatomy to the current TanStack Form string field through \`field.TextField\`.

### Why it exists

Text fields otherwise repeat name, value, change, blur, validation visibility, error formatting, accessibility, and submission-state wiring in every form. Vireo centralizes that plumbing while preserving MUI's slots, slot props, styling, variants, and ordinary input props. Use it for string fields created by \`useVireoForm\`; use a more specific bound field component when the value is not a string.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormTextField>;

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
    "Passes a Zod schema directly to TanStack Form's dynamic field validator, validating first on submit and then on change.",
  ),
};

export const ZodFormValidation: Story = {
  render: () => <ZodFormValidationExample />,
  parameters: createSourceParameters(
    zodFormValidationExampleSource,
    "Passes one Zod object schema to useVireoForm so its path-aware issues reach the matching fields without repeated field-level schemas.",
  ),
};
