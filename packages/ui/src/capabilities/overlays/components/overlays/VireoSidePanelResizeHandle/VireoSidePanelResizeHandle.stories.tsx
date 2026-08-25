import DefaultExample from "@/capabilities/overlays/components/overlays/VireoSidePanelResizeHandle/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/overlays/components/overlays/VireoSidePanelResizeHandle/internal/storybook/DefaultExample.tsx?raw";
import PointerInteractionsExample from "@/capabilities/overlays/components/overlays/VireoSidePanelResizeHandle/internal/storybook/PointerInteractionsExample";
import pointerInteractionsExampleSource from "@/capabilities/overlays/components/overlays/VireoSidePanelResizeHandle/internal/storybook/PointerInteractionsExample.tsx?raw";
import ResizingExample from "@/capabilities/overlays/components/overlays/VireoSidePanelResizeHandle/internal/storybook/ResizingExample";
import resizingExampleSource from "@/capabilities/overlays/components/overlays/VireoSidePanelResizeHandle/internal/storybook/ResizingExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { VireoSidePanelResizeHandle } from "./VireoSidePanelResizeHandle";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "TypeScript/UI/Capabilities/Overlays/VireoSidePanelResizeHandle",
  component: VireoSidePanelResizeHandle,
  tags: ["autodocs"],
  args: { onResizeStart: fn(), onResizeDoubleClick: fn() },
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Provides the standard pointer interaction target and visual feedback for resizing Vireo side panels.\n\n### Why it exists\n\nResizable overlay panels need a forgiving hit area, consistent hover and active feedback, and predictable event composition without each frame rebuilding those details. Vireo owns that shared overlay anatomy so panels behave and theme consistently. Use it with Vireo side-panel resizing; use a keyboard-operable separator or full split-pane control when resizing is itself a standalone accessible interaction.",
      },
    },
  },
} satisfies Meta<typeof VireoSidePanelResizeHandle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <DefaultExample />, parameters: source(defaultExampleSource) };
export const Resizing: Story = { render: () => <ResizingExample />, parameters: source(resizingExampleSource) };
export const PointerInteractions: Story = {
  render: ({ onResizeDoubleClick, onResizeStart }) => (
    <PointerInteractionsExample onResizeStart={onResizeStart} onResizeDoubleClick={onResizeDoubleClick} />
  ),
  parameters: source(pointerInteractionsExampleSource),
  play: async ({ args, canvasElement }) => {
    const handle = within(canvasElement).getByRole("presentation");
    await userEvent.pointer({ keys: "[MouseLeft]", target: handle });
    await expect(args.onResizeStart).toHaveBeenCalledOnce();
    await userEvent.dblClick(handle);
    await expect(args.onResizeDoubleClick).toHaveBeenCalledOnce();
  },
};
