import DefaultExample from "@/capabilities/infinite-canvas/components/layout/VireoInfiniteCanvasBody/internal/storybook/DefaultExample";
import defaultSource from "@/capabilities/infinite-canvas/components/layout/VireoInfiniteCanvasBody/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoInfiniteCanvasBody } from "./VireoInfiniteCanvasBody";
const meta = {
  title: "TypeScript/UI/Capabilities/Infinite Canvas/VireoInfiniteCanvasBody",
  component: VireoInfiniteCanvasBody,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "VireoInfiniteCanvasBody applies the current world transform to positioned canvas content.\n\n## Why it exists\n\nWorld nodes must pan and scale together while overlays remain fixed. Use this component only inside VireoInfiniteCanvas for the transformed content plane.",
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof VireoInfiniteCanvasBody>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: { docs: { source: { code: defaultSource } } },
};
