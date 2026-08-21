import DefaultExample from "@/capabilities/infinite-canvas/components/layout/VireoInfiniteCanvas/internal/storybook/DefaultExample";
import defaultSource from "@/capabilities/infinite-canvas/components/layout/VireoInfiniteCanvas/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoInfiniteCanvas } from "./VireoInfiniteCanvas";
const meta = {
  title: "Infinite Canvas/Layout/VireoInfiniteCanvas",
  component: VireoInfiniteCanvas,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "VireoInfiniteCanvas owns controlled-or-uncontrolled pan and zoom state, coordinate conversion, a theme-aware grid, and fullscreen access.\n\n## Why it exists\n\nDiagram and spatial editors otherwise duplicate subtle pointer capture, cursor-centered zoom, scale clamping, and coordinate math. Compose transformed content with VireoInfiniteCanvasBody and fixed controls with VireoInfiniteCanvasOverlay.",
      },
    },
  },
} satisfies Meta<typeof VireoInfiniteCanvas>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: { docs: { source: { code: defaultSource } } },
};
