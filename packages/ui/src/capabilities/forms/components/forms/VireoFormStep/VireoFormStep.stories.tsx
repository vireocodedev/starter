import DefaultExample from "@/capabilities/forms/components/forms/VireoFormStep/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormStep/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormStep } from "./VireoFormStep";

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
  title: "Capabilities/Forms/Multi-Step/VireoFormStep",
  component: VireoFormStep,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoFormStep renders one configured multi-step form stage as a labelled, focusable region.

### Why it exists

Step content needs consistent mounting, hidden-state preservation, accessible labelling, and focus restoration as navigation changes. Vireo owns those semantics so consumers only associate content with its typed step id; use it inside form.MultiStep rather than as a general-purpose section.`,
      },
    },
    controls: { disable: true },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { id: "account" },
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};
