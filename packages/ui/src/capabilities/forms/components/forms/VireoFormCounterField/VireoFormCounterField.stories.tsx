import BoundsAndDecimalSteppingExample from "@/capabilities/forms/components/forms/VireoFormCounterField/internal/storybook/BoundsAndDecimalSteppingExample";
import boundsAndDecimalSteppingSource from "@/capabilities/forms/components/forms/VireoFormCounterField/internal/storybook/BoundsAndDecimalSteppingExample.tsx?raw";
import CustomizedSlotsExample from "@/capabilities/forms/components/forms/VireoFormCounterField/internal/storybook/CustomizedSlotsExample";
import customizedSlotsSource from "@/capabilities/forms/components/forms/VireoFormCounterField/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/forms/VireoFormCounterField/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormCounterField/internal/storybook/DefaultExample.tsx?raw";
import NullableValueExample from "@/capabilities/forms/components/forms/VireoFormCounterField/internal/storybook/NullableValueExample";
import nullableValueSource from "@/capabilities/forms/components/forms/VireoFormCounterField/internal/storybook/NullableValueExample.tsx?raw";
import StatesExample from "@/capabilities/forms/components/forms/VireoFormCounterField/internal/storybook/StatesExample";
import statesSource from "@/capabilities/forms/components/forms/VireoFormCounterField/internal/storybook/StatesExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/forms/components/forms/VireoFormCounterField/internal/storybook/ThemeCustomizationExample";
import themeCustomizationSource from "@/capabilities/forms/components/forms/VireoFormCounterField/internal/storybook/ThemeCustomizationExample.tsx?raw";
import ZodFieldValidationExample from "@/capabilities/forms/components/forms/VireoFormCounterField/internal/storybook/ZodFieldValidationExample";
import zodFieldValidationSource from "@/capabilities/forms/components/forms/VireoFormCounterField/internal/storybook/ZodFieldValidationExample.tsx?raw";
import ZodFormValidationExample from "@/capabilities/forms/components/forms/VireoFormCounterField/internal/storybook/ZodFormValidationExample";
import zodFormValidationSource from "@/capabilities/forms/components/forms/VireoFormCounterField/internal/storybook/ZodFormValidationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { VireoFormCounterField } from "./VireoFormCounterField";

function createSourceParameters(code: string, description?: string) {
  return {
    docs: {
      ...(description && { description: { story: description } }),
      source: { code, language: "tsx", type: "code" as const },
    },
  };
}

const meta = {
  title: "Capabilities/Forms/Fields/VireoFormCounterField",
  component: VireoFormCounterField,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormCounterField binds an editable, button-stepped \`number | null\` value to the current TanStack Form field through \`field.CounterField\`.

### Why it exists

Quantity counters otherwise repeat centered numeric editing, decrement and increment controls, nullable baselines, bounds, decimal-safe stepping, draft text, keyboard behavior, validation visibility, and accessible spinbutton wiring. Vireo centralizes that contract while preserving slots and MUI theming. Use it for human-scale quantities and bounded numeric settings; use \`field.NumberField\` for ordinary numeric entry or a domain-specific input for formatted and arbitrary-precision values.`,
      },
    },
  },
  args: { "aria-label": "Counter" },
} satisfies Meta<typeof VireoFormCounterField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton", { name: "Seats" });
    await userEvent.click(canvas.getByRole("button", { name: "Increase" }));
    await userEvent.click(canvas.getByRole("button", { name: "Decrease" }));
    input.focus();
    await userEvent.keyboard("{ArrowUp}");
    await userEvent.click(canvas.getByRole("button", { name: "Save capacity" }));
    await expect(canvas.getByText("Saved 3 seats")).toBeInTheDocument();
  },
};

export const BoundsAndDecimalStepping: Story = {
  render: () => <BoundsAndDecimalSteppingExample />,
  parameters: createSourceParameters(
    boundsAndDecimalSteppingSource,
    "Shows decimal-safe stepping, bound-disabled actions, and one-step correction of an external out-of-range value.",
  ),
};

export const NullableValue: Story = {
  render: () => <NullableValueExample />,
  parameters: createSourceParameters(
    nullableValueSource,
    "Starts empty, uses zero as the stepping baseline, and allows direct clearing back to null.",
  ),
};

export const States: Story = {
  render: () => <StatesExample />,
  parameters: createSourceParameters(statesSource, "Compares disabled, read-only, bound, and direct-error states."),
};

export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: createSourceParameters(
    customizedSlotsSource,
    "Replaces both action icons and uses owner-state-aware button slot props without weakening the counter semantics.",
  ),
};

export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: createSourceParameters(
    themeCustomizationSource,
    "Applies component theme defaults and state-aware slot styling while extending the shared dark theme.",
  ),
};

export const ZodFieldValidation: Story = {
  render: () => <ZodFieldValidationExample />,
  parameters: createSourceParameters(
    zodFieldValidationSource,
    "Attaches one nullable numeric Zod schema to form.Field.",
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Reserve seats" }));
    await expect(canvas.getByText("Choose at least one seat.")).toBeInTheDocument();
  },
};

export const ZodFormValidation: Story = {
  render: () => <ZodFormValidationExample />,
  parameters: createSourceParameters(
    zodFormValidationSource,
    "Uses one Zod object schema to validate multiple counters without repeating field-level schemas.",
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save inventory" }));
    await expect(canvas.getByText("Choose a package quantity.")).toBeInTheDocument();
    await expect(canvas.getByText("Reserve at least two units.")).toBeInTheDocument();
  },
};
