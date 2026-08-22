import DefaultExample from "@/capabilities/forms/components/forms/VireoFormNextStepButton/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormNextStepButton/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormNextStepButton } from "./VireoFormNextStepButton";

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
  title: "UI/Capabilities/Forms/Multi-Step/VireoFormNextStepButton",
  component: VireoFormNextStepButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoFormNextStepButton validates and advances the current step, then yields to form.SubmitButton on the final step.

### Why it exists

Step flows otherwise duplicate validation gates, pending state, accessible loading feedback, and final-step submit switching. Vireo binds those behaviors to the multi-step controller while preserving ordinary MUI Button customization.`,
      },
    },
    controls: { disable: true },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormNextStepButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};
