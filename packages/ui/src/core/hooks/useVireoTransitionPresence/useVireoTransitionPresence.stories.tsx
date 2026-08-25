import DefaultExample from "@/core/hooks/useVireoTransitionPresence/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/hooks/useVireoTransitionPresence/internal/storybook/DefaultExample.tsx?raw";
import InterruptedExitExample from "@/core/hooks/useVireoTransitionPresence/internal/storybook/InterruptedExitExample";
import interruptedExitExampleSource from "@/core/hooks/useVireoTransitionPresence/internal/storybook/InterruptedExitExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "TypeScript/UI/Core/Hooks/useVireoTransitionPresence",
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Retains the latest non-null value while an external transition completes its exit.\n\n### Why it exists\n\nConditional overlays, alerts, and transient details must often animate out after their source value has already disappeared. Vireo owns the retention and interrupted-exit lifecycle so consumers can use any transition without duplicating race-prone cached-value state. Use it when a transition needs retained content; use ordinary conditional rendering when no exit animation exists.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: source(defaultExampleSource),
};

export const InterruptedExit: Story = {
  render: () => <InterruptedExitExample />,
  parameters: source(interruptedExitExampleSource),
};
