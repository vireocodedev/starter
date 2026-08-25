import DefaultExample from "@/core/hooks/useVireoFullscreen/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/hooks/useVireoFullscreen/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "TypeScript/UI/Core/Hooks/useVireoFullscreen",
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Observes and controls standard browser fullscreen ownership for one target element.\n\n### Why it exists\n\nFullscreen surfaces otherwise repeat owner-document subscriptions, support checks, ownership safeguards, and stable command wiring. Vireo centralizes those rules so a component exits only fullscreen it owns and still reflects changes caused by Escape or another element. Use it for element-owned fullscreen behavior; keep application policy and fullscreen error presentation in the consumer.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: { docs: { source: { code: defaultExampleSource, language: "tsx", type: "code" } } },
};
