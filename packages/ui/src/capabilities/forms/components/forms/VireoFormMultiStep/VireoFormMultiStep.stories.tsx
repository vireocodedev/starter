import DefaultExample from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormMultiStep } from "./VireoFormMultiStep";

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
  title: "Forms/Forms/VireoFormMultiStep",
  component: VireoFormMultiStep,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoFormMultiStep provides the stable composition boundary for one TanStack-backed multi-step form flow.

### Why it exists

Multi-step workflows otherwise repeat step registration, conditional visibility, focus movement, value preservation, locale wiring, and reset behavior around the same form instance. Vireo owns that coordination while leaving fields and visual progress explicit; use it for one schema and submission distributed across steps, not for unrelated forms connected only by routing.`,
      },
    },
    controls: { disable: true },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormMultiStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};
