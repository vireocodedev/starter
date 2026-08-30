import CustomOptionPresentationExample from "@/capabilities/forms/components/forms/VireoFormToggleButtonGroupField/internal/storybook/CustomOptionPresentationExample";
import customOptionPresentationSource from "@/capabilities/forms/components/forms/VireoFormToggleButtonGroupField/internal/storybook/CustomOptionPresentationExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/forms/VireoFormToggleButtonGroupField/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormToggleButtonGroupField/internal/storybook/DefaultExample.tsx?raw";
import DisableClearableExample from "@/capabilities/forms/components/forms/VireoFormToggleButtonGroupField/internal/storybook/DisableClearableExample";
import disableClearableSource from "@/capabilities/forms/components/forms/VireoFormToggleButtonGroupField/internal/storybook/DisableClearableExample.tsx?raw";
import DisabledAndReadOnlyExample from "@/capabilities/forms/components/forms/VireoFormToggleButtonGroupField/internal/storybook/DisabledAndReadOnlyExample";
import disabledAndReadOnlySource from "@/capabilities/forms/components/forms/VireoFormToggleButtonGroupField/internal/storybook/DisabledAndReadOnlyExample.tsx?raw";
import MultipleSelectionExample from "@/capabilities/forms/components/forms/VireoFormToggleButtonGroupField/internal/storybook/MultipleSelectionExample";
import multipleSelectionSource from "@/capabilities/forms/components/forms/VireoFormToggleButtonGroupField/internal/storybook/MultipleSelectionExample.tsx?raw";
import VerticalOrientationExample from "@/capabilities/forms/components/forms/VireoFormToggleButtonGroupField/internal/storybook/VerticalOrientationExample";
import verticalOrientationSource from "@/capabilities/forms/components/forms/VireoFormToggleButtonGroupField/internal/storybook/VerticalOrientationExample.tsx?raw";
import ZodFieldValidationExample from "@/capabilities/forms/components/forms/VireoFormToggleButtonGroupField/internal/storybook/ZodFieldValidationExample";
import zodFieldValidationSource from "@/capabilities/forms/components/forms/VireoFormToggleButtonGroupField/internal/storybook/ZodFieldValidationExample.tsx?raw";
import ZodFormValidationExample from "@/capabilities/forms/components/forms/VireoFormToggleButtonGroupField/internal/storybook/ZodFormValidationExample";
import zodFormValidationSource from "@/capabilities/forms/components/forms/VireoFormToggleButtonGroupField/internal/storybook/ZodFormValidationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { VireoFormToggleButtonGroupField } from "./VireoFormToggleButtonGroupField";

function createSourceParameters(code: string, description?: string) {
  return {
    docs: {
      ...(description && { description: { story: description } }),
      source: { code, language: "tsx", type: "code" as const },
    },
  };
}

const meta = {
  title: "TypeScript/UI/Capabilities/Forms/Fields/VireoFormToggleButtonGroupField",
  component: VireoFormToggleButtonGroupField,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormToggleButtonGroupField binds an exclusive scalar or ordered scalar array to the current TanStack Form field through \`field.ToggleButtonGroupField\`.

### Why it exists

Toggle-button choices otherwise repeat scalar identity, nullable versus array state, clear protection, canonical ordering, disabled and read-only interaction, error visibility, helper-text accessibility, and form lifecycle wiring. Vireo centralizes that plumbing while preserving MUI visual props, slots, option rendering, and theming. Use it for a short, always-visible set of choices; use a radio group for radio semantics or a select/autocomplete when choices should remain collapsed or searchable.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  args: { "aria-label": "Selection", options: [] },
} satisfies Meta<typeof VireoFormToggleButtonGroupField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const compact = canvas.getByRole("button", { name: "Compact" });
    await userEvent.click(compact);
    await expect(compact).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(compact);
    await expect(compact).toHaveAttribute("aria-pressed", "false");
  },
};

export const MultipleSelection: Story = {
  render: () => <MultipleSelectionExample />,
  parameters: createSourceParameters(
    multipleSelectionSource,
    "Stores an array, permits an empty selection, and emits selected values in option order.",
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Push" }));
    await userEvent.click(canvas.getByRole("button", { name: "Email" }));
    await expect(canvas.getByText("Selected: email, push")).toBeInTheDocument();
  },
};

export const DisableClearable: Story = {
  render: () => <DisableClearableExample />,
  parameters: createSourceParameters(
    disableClearableSource,
    "Keeps the final exclusive or multiple selection while still allowing replacement and additional choices.",
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const exclusiveGroup = canvas.getByRole("group", { name: "Exclusive cadence" });
    const multipleGroup = canvas.getByRole("group", { name: "Required report cadences" });
    const weekly = within(exclusiveGroup).getByRole("button", { name: "Weekly" });
    const daily = within(multipleGroup).getByRole("button", { name: "Daily" });
    await userEvent.click(weekly);
    await userEvent.click(daily);
    await expect(weekly).toHaveAttribute("aria-pressed", "true");
    await expect(daily).toHaveAttribute("aria-pressed", "true");
  },
};

export const VerticalOrientation: Story = {
  render: () => <VerticalOrientationExample />,
  parameters: createSourceParameters(
    verticalOrientationSource,
    "Stacks longer choice labels vertically without truncating their content.",
  ),
};

export const DisabledAndReadOnly: Story = {
  render: () => <DisabledAndReadOnlyExample />,
  parameters: createSourceParameters(
    disabledAndReadOnlySource,
    "Compares unavailable buttons with the value-only presentation used by read-only forms.",
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const readOnlyLabelBox = canvas.getByText("Read only").closest(".VireoLabelBox-root");
    await expect(readOnlyLabelBox).not.toBeNull();
    await expect(within(readOnlyLabelBox as HTMLElement).queryByRole("group")).not.toBeInTheDocument();
    await expect(within(readOnlyLabelBox as HTMLElement).getByText("Editor")).toBeInTheDocument();
  },
};

export const CustomOptionPresentation: Story = {
  render: () => <CustomOptionPresentationExample />,
  parameters: createSourceParameters(
    customOptionPresentationSource,
    "Uses rich option content, selected state, per-option props, and an unavailable choice without changing stored values.",
  ),
};

export const ZodFieldValidation: Story = {
  render: () => <ZodFieldValidationExample />,
  parameters: createSourceParameters(
    zodFieldValidationSource,
    "Passes a nullable Zod schema directly to the field validator.",
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Create ticket" }));
    await expect(canvas.getByText("Choose a priority.")).toBeInTheDocument();
  },
};

export const ZodFormValidation: Story = {
  render: () => <ZodFormValidationExample />,
  parameters: createSourceParameters(
    zodFormValidationSource,
    "Uses one Zod object schema to validate exclusive and multiple toggle-button fields together.",
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save settings" }));
    await expect(canvas.getByText("Choose visibility.")).toBeInTheDocument();
    await expect(canvas.getByText("Choose at least one channel.")).toBeInTheDocument();
  },
};
