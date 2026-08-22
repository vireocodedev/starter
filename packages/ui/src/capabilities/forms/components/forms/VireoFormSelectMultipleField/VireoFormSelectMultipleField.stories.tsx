import CompactSummaryExample from "@/capabilities/forms/components/forms/VireoFormSelectMultipleField/internal/storybook/CompactSummaryExample";
import compactSummaryExampleSource from "@/capabilities/forms/components/forms/VireoFormSelectMultipleField/internal/storybook/CompactSummaryExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/forms/VireoFormSelectMultipleField/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormSelectMultipleField/internal/storybook/DefaultExample.tsx?raw";
import ZodFieldValidationExample from "@/capabilities/forms/components/forms/VireoFormSelectMultipleField/internal/storybook/ZodFieldValidationExample";
import zodFieldValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormSelectMultipleField/internal/storybook/ZodFieldValidationExample.tsx?raw";
import ZodFormValidationExample from "@/capabilities/forms/components/forms/VireoFormSelectMultipleField/internal/storybook/ZodFormValidationExample";
import zodFormValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormSelectMultipleField/internal/storybook/ZodFormValidationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormSelectMultipleField } from "./VireoFormSelectMultipleField";

function createSourceParameters(code: string, description?: string) {
  return {
    docs: {
      ...(description && { description: { story: description } }),
      source: { code, language: "tsx", type: "code" as const },
    },
  };
}

const meta = {
  title: "UI/Capabilities/Forms/Fields/VireoFormSelectMultipleField",
  component: VireoFormSelectMultipleField,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormSelectMultipleField binds an ordered array of typed option values to the current TanStack Form field through \`field.SelectMultipleField\`.

### Why it exists

Multiple selects otherwise repeat array mapping, checkbox-row behavior, compact selected-value presentation, clear-all handling, validation visibility, accessibility, and submission wiring in every form. Vireo centralizes that plumbing while preserving typed options, MUI slots, theming, and a custom selection-summary escape hatch. Use it for a moderate non-searchable set of string- or number-valued choices created by \`useVireoForm\`; use a multiple autocomplete when users need search or filtering.`,
      },
    },
  },
  argTypes: {
    classes: { control: false },
    renderSelectedOptions: { control: false },
    slotProps: { control: false },
    slots: { control: false },
  },
  args: { label: "Selections", options: [], getOptionValue: () => "", renderOption: () => null },
} satisfies Meta<typeof VireoFormSelectMultipleField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const CompactSummary: Story = {
  render: () => <CompactSummaryExample />,
  parameters: createSourceParameters(
    compactSummaryExampleSource,
    "Keeps the closed field to one line by showing two labels and a hidden-selection count.",
  ),
};

export const ZodFieldValidation: Story = {
  render: () => <ZodFieldValidationExample />,
  parameters: createSourceParameters(
    zodFieldValidationExampleSource,
    "Passes a Zod array schema directly to the field and requires at least two selections.",
  ),
};

export const ZodFormValidation: Story = {
  render: () => <ZodFormValidationExample />,
  parameters: createSourceParameters(
    zodFormValidationExampleSource,
    "Passes one Zod object schema to useVireoForm so text and multiple-select issues reach their fields without repeated schemas.",
  ),
};
