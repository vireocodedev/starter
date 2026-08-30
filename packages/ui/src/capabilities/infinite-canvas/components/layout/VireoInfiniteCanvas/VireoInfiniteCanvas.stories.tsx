import DefaultExample from "@/capabilities/infinite-canvas/components/layout/VireoInfiniteCanvas/internal/storybook/DefaultExample";
import defaultSource from "@/capabilities/infinite-canvas/components/layout/VireoInfiniteCanvas/internal/storybook/DefaultExample.tsx?raw";
import KeyboardControlsExample from "@/capabilities/infinite-canvas/components/layout/VireoInfiniteCanvas/internal/storybook/KeyboardControlsExample";
import keyboardControlsSource from "@/capabilities/infinite-canvas/components/layout/VireoInfiniteCanvas/internal/storybook/KeyboardControlsExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { VireoInfiniteCanvas } from "./VireoInfiniteCanvas";
import type { VireoInfiniteCanvasAccessibleNameProps, VireoInfiniteCanvasOwnProps } from "./VireoInfiniteCanvas.types";

type VireoInfiniteCanvasStoryArgs = VireoInfiniteCanvasOwnProps & {
  [TPropName in keyof VireoInfiniteCanvasAccessibleNameProps]?: VireoInfiniteCanvasAccessibleNameProps[TPropName];
};

const meta: Meta<typeof VireoInfiniteCanvas> = {
  title: "TypeScript/UI/Capabilities/Infinite Canvas/VireoInfiniteCanvas",
  component: VireoInfiniteCanvas,
  tags: ["autodocs", "vireo-matrix"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "VireoInfiniteCanvas provides a named, keyboard- and pointer-operable world-coordinate surface with controlled-or-uncontrolled pan and zoom state.\n\n### Why it exists\n\nDiagram and spatial editors otherwise duplicate subtle input handling, focus semantics, scale clamping, and coordinate math. Give every canvas a localized accessible name, compose transformed content with VireoInfiniteCanvasBody, and use VireoInfiniteCanvasOverlay for fixed controls; disable built-in keyboard controls only when another complete keyboard interaction model replaces them.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<VireoInfiniteCanvasStoryArgs>;
export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: { docs: { source: { code: defaultSource } } },
};

export const KeyboardControls: Story = {
  render: () => <KeyboardControlsExample />,
  parameters: { docs: { source: { code: keyboardControlsSource } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const surface = canvas.getByRole("region", { name: "Keyboard navigation canvas" });

    surface.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByText("Pan -40, 0 · Zoom 100%")).toBeInTheDocument();

    await userEvent.keyboard("=");
    await expect(canvas.getByText(/Zoom 110%$/u)).toBeInTheDocument();

    await userEvent.keyboard("0");
    await expect(canvas.getByText("Pan 0, 0 · Zoom 100%")).toBeInTheDocument();
  },
};
