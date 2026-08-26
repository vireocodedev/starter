import ActionConsequencesExample from "@/core/components/controls/VireoActionPreviewButton/internal/storybook/ActionConsequencesExample";
import actionConsequencesExampleSource from "@/core/components/controls/VireoActionPreviewButton/internal/storybook/ActionConsequencesExample.tsx?raw";
import DefaultExample from "@/core/components/controls/VireoActionPreviewButton/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/controls/VireoActionPreviewButton/internal/storybook/DefaultExample.tsx?raw";
import NarrowLayoutExample from "@/core/components/controls/VireoActionPreviewButton/internal/storybook/NarrowLayoutExample";
import narrowLayoutExampleSource from "@/core/components/controls/VireoActionPreviewButton/internal/storybook/NarrowLayoutExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoActionPreviewButton } from "./VireoActionPreviewButton";

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
  title: "TypeScript/UI/Core/Controls/VireoActionPreviewButton",
  component: VireoActionPreviewButton,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `Pairs an action label with a concise, always-visible preview of what committing it will do.

### Why it exists

High-consequence and multi-record actions are easier to trust when users can see their scope before clicking. Vireo owns the consistent two-level button anatomy, density, and accessible semantics. Use it for actions whose result, quantity, or permanence deserves advance clarification; use an ordinary button when the label already communicates the complete outcome.`,
      },
    },
  },
  args: { label: "Save changes", preview: "Commits 3 modified records" },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoActionPreviewButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const ActionConsequences: Story = {
  render: () => <ActionConsequencesExample />,
  parameters: createSourceParameters(actionConsequencesExampleSource),
};

export const NarrowLayout: Story = {
  render: () => <NarrowLayoutExample />,
  parameters: createSourceParameters(narrowLayoutExampleSource),
};
