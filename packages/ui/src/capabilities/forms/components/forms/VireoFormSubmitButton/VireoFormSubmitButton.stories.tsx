import ConsumerLoadingExample from "@/capabilities/forms/components/forms/VireoFormSubmitButton/internal/storybook/ConsumerLoadingExample";
import consumerLoadingExampleSource from "@/capabilities/forms/components/forms/VireoFormSubmitButton/internal/storybook/ConsumerLoadingExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/forms/VireoFormSubmitButton/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormSubmitButton/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { VireoFormSubmitButton } from "./VireoFormSubmitButton";

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
  title: "UI/Capabilities/Forms/VireoFormSubmitButton",
  component: VireoFormSubmitButton,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `Submits a Vireo form and reflects its asynchronous submission lifecycle as a loading button.

### Why it exists

Form submit actions repeatedly need the same native semantics, pending-state subscription, duplicate-submission protection, and MUI loading presentation. Vireo owns that wiring so consumers do not manually mirror form state into every submit button. Obtain it from \`useVireoForm\` as \`form.SubmitButton\`; use a normal button when the action does not submit that form.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormSubmitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
  play: async ({ canvasElement }) => {
    const save = within(canvasElement).getByRole("button", { name: "Save project" });

    await userEvent.click(save);
    await expect(save).toBeDisabled();
    await waitFor(() => expect(save).toBeEnabled(), { timeout: 2000 });
  },
};

export const ConsumerLoading: Story = {
  render: () => <ConsumerLoadingExample />,
  parameters: createSourceParameters(consumerLoadingExampleSource),
};
