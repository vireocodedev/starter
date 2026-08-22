import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import { SIDE_PANEL_WIDTH_CSS_VAR } from "@/capabilities/overlays/constants/overlay.constants";
import DefaultExample from "@/capabilities/overlays/components/overlays/VireoResponsiveOverlayFrame/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/overlays/components/overlays/VireoResponsiveOverlayFrame/internal/storybook/DefaultExample.tsx?raw";
import DockedSidePanelExample from "@/capabilities/overlays/components/overlays/VireoResponsiveOverlayFrame/internal/storybook/DockedSidePanelExample";
import dockedSidePanelExampleSource from "@/capabilities/overlays/components/overlays/VireoResponsiveOverlayFrame/internal/storybook/DockedSidePanelExample.tsx?raw";
import MobileBottomSheetExample from "@/capabilities/overlays/components/overlays/VireoResponsiveOverlayFrame/internal/storybook/MobileBottomSheetExample";
import mobileBottomSheetExampleSource from "@/capabilities/overlays/components/overlays/VireoResponsiveOverlayFrame/internal/storybook/MobileBottomSheetExample.tsx?raw";
import OverlaySidePanelExample from "@/capabilities/overlays/components/overlays/VireoResponsiveOverlayFrame/internal/storybook/OverlaySidePanelExample";
import overlaySidePanelExampleSource from "@/capabilities/overlays/components/overlays/VireoResponsiveOverlayFrame/internal/storybook/OverlaySidePanelExample.tsx?raw";
import ResizableDockedSidePanelExample from "@/capabilities/overlays/components/overlays/VireoResponsiveOverlayFrame/internal/storybook/ResizableDockedSidePanelExample";
import resizableDockedSidePanelExampleSource from "@/capabilities/overlays/components/overlays/VireoResponsiveOverlayFrame/internal/storybook/ResizableDockedSidePanelExample.tsx?raw";
import { VireoResponsiveOverlayFrame } from "./VireoResponsiveOverlayFrame";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "UI/Capabilities/Overlays/VireoResponsiveOverlayFrame",
  component: VireoResponsiveOverlayFrame,
  tags: ["autodocs"],
  args: { open: false, onClose: fn(), children: null },
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Coordinates one content flow across a mobile bottom sheet and configurable desktop dialog or side-panel surfaces.\n\n### Why it exists\n\nResponsive workflows otherwise duplicate breakpoint selection, panel sizing, resize behavior, docked-space fallback, and exit lifecycle wiring every time the same content needs mobile and desktop presentation. Vireo owns that orchestration so consumers can choose intent while the frame keeps surface behavior consistent. Use it when one overlay flow genuinely changes surface by viewport; use a direct dialog, drawer, or docked panel when the surface never needs responsive coordination.",
      },
    },
  },
} satisfies Meta<typeof VireoResponsiveOverlayFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ onClose }) => <DefaultExample onClose={onClose} />,
  parameters: source(defaultExampleSource),
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "View customer details" }));
    await userEvent.click(
      within(canvasElement.ownerDocument.body).getByRole("button", { name: "Close customer details" }),
    );
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const MobileBottomSheet: Story = {
  render: () => <MobileBottomSheetExample />,
  parameters: { ...source(mobileBottomSheetExampleSource), viewport: { defaultViewport: "mobile1" } },
};

export const OverlaySidePanel: Story = {
  render: () => <OverlaySidePanelExample />,
  parameters: source(overlaySidePanelExampleSource),
};

export const DockedSidePanel: Story = {
  render: () => <DockedSidePanelExample />,
  parameters: source(dockedSidePanelExampleSource),
};

export const ResizableDockedSidePanel: Story = {
  render: () => <ResizableDockedSidePanelExample />,
  parameters: source(resizableDockedSidePanelExampleSource),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "View customer details" }));
    const overlayCanvas = within(canvasElement.ownerDocument.body);
    const handle = overlayCanvas.getByRole("presentation");
    const surface = overlayCanvas.getByRole("complementary");
    fireEvent.mouseDown(handle, { clientX: 800, detail: 1 });
    fireEvent.mouseMove(window, { clientX: 700 });
    fireEvent.mouseUp(window);
    await waitFor(() => expect(surface.parentElement?.style.getPropertyValue(SIDE_PANEL_WIDTH_CSS_VAR)).toBe("520px"));
    fireEvent.doubleClick(handle);
    await waitFor(() => expect(surface.parentElement?.style.getPropertyValue(SIDE_PANEL_WIDTH_CSS_VAR)).toBe("420px"));
  },
};
