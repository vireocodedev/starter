import DefaultExample from "@/capabilities/forms/components/forms/VireoFormResetButton/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormResetButton/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
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
  title: "UI/Capabilities/Forms/VireoFormResetButton",
  component: VireoFormResetButton,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Project name" });
    const reset = canvas.getByRole("button", { name: "Reset changes" });

    await expect(reset).toBeDisabled();
    await userEvent.clear(input);
    await userEvent.type(input, "Atlas");
    await expect(reset).toBeEnabled();
    await userEvent.click(reset);
    await expect(input).toHaveValue("Northstar");
    await expect(reset).toBeDisabled();
  },
};
