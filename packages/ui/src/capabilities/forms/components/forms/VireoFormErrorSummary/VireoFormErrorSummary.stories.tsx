import DefaultExample from "@/capabilities/forms/components/forms/VireoFormErrorSummary/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormErrorSummary/internal/storybook/DefaultExample.tsx?raw";
import MultiStepErrorsExample from "@/capabilities/forms/components/forms/VireoFormErrorSummary/internal/storybook/MultiStepErrorsExample";
import multiStepErrorsExampleSource from "@/capabilities/forms/components/forms/VireoFormErrorSummary/internal/storybook/MultiStepErrorsExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormErrorSummary } from "./VireoFormErrorSummary";

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
  title: "TypeScript/UI/Capabilities/Forms/VireoFormErrorSummary",
  component: VireoFormErrorSummary,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoFormErrorSummary presents current validation failures as an accessible summary with links back to mapped fields.

### Why it exists

Long and multi-step forms otherwise leave users searching for invalid controls, especially when an error belongs to an inactive step. Vireo groups failures, focuses the summary for unmapped errors, and navigates mapped items back to their controls; use it alongside inline field errors, not instead of them.`,
      },
    },
    controls: { disable: true },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormErrorSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const MultiStepErrors: Story = {
  render: () => <MultiStepErrorsExample />,
  parameters: createSourceParameters(multiStepErrorsExampleSource),
};
