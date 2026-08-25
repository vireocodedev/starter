import DefaultExample from "@/capabilities/forms/components/forms/VireoFormPreviousStepButton/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormPreviousStepButton/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormPreviousStepButton } from "./VireoFormPreviousStepButton";

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
  title: "TypeScript/UI/Capabilities/Forms/Multi-Step/VireoFormPreviousStepButton",
  component: VireoFormPreviousStepButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoFormPreviousStepButton returns to the previous active step without revalidating the current step.

### Why it exists

Previous-step actions need consistent active-step traversal, transition locking, localization, and first-step visibility. Vireo binds that behavior to the current multi-step form while retaining the MUI Button customization contract.`,
      },
    },
    controls: { disable: true },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormPreviousStepButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};
