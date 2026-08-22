import DefaultExample from "@/core/hooks/useVireoOnlineStatus/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/hooks/useVireoOnlineStatus/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "UI/Core/Hooks/useVireoOnlineStatus",
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Subscribes React to the browser's online/offline status through `useSyncExternalStore`.\n\n### Why it exists\n\nBrowser connectivity changes are an external store shared by the whole document. Vireo owns the SSR-safe subscription wiring so consumers do not duplicate listeners or retain inconsistent initial state. Use it as a lightweight browser hint; use Infrastructure's heartbeat-backed connectivity state when endpoint reachability matters.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: {
    docs: { source: { code: defaultExampleSource, language: "tsx", type: "code" } },
  },
};
