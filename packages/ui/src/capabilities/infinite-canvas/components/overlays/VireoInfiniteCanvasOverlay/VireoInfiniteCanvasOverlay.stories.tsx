import DefaultExample from "@/capabilities/infinite-canvas/components/overlays/VireoInfiniteCanvasOverlay/internal/storybook/DefaultExample";
import defaultSource from "@/capabilities/infinite-canvas/components/overlays/VireoInfiniteCanvasOverlay/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoInfiniteCanvasOverlay } from "./VireoInfiniteCanvasOverlay";
const meta = {
  title: "Capabilities/Infinite Canvas/VireoInfiniteCanvasOverlay",
  component: VireoInfiniteCanvasOverlay,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "VireoInfiniteCanvasOverlay anchors interactive controls to eight fixed canvas positions.\n\n## Why it exists\n\nToolbars, minimaps, and zoom controls must stay in viewport coordinates and must not begin canvas panning. Use this overlay inside VireoInfiniteCanvas, outside its transformed body.",
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof VireoInfiniteCanvasOverlay>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: { docs: { source: { code: defaultSource } } },
};
