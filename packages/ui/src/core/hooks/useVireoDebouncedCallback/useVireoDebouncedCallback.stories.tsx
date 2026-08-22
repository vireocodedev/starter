import CancelAndFlushExample from "@/core/hooks/useVireoDebouncedCallback/internal/storybook/CancelAndFlushExample";
import cancelAndFlushExampleSource from "@/core/hooks/useVireoDebouncedCallback/internal/storybook/CancelAndFlushExample.tsx?raw";
import DefaultExample from "@/core/hooks/useVireoDebouncedCallback/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/hooks/useVireoDebouncedCallback/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "UI/Core/Hooks/useVireoDebouncedCallback",
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Creates a trailing debounced callback with explicit scheduling controls.\n\n### Why it exists\n\nSearch, filtering, persistence, and other high-frequency interactions repeatedly need the same latest-callback, cleanup, cancellation, and flushing behavior. Vireo owns that lifecycle so consumers do not rebuild timer bookkeeping or retain stale React closures. Use it for delayed side effects; prefer `useDeferredValue` when only rendering priority should change.",
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

export const CancelAndFlush: Story = {
  render: () => <CancelAndFlushExample />,
  parameters: source(cancelAndFlushExampleSource),
};
