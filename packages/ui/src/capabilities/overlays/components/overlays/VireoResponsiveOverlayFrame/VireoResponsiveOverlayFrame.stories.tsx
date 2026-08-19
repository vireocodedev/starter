import { VireoResponsiveOverlayFrame } from "./VireoResponsiveOverlayFrame";
import { VIREO_RESPONSIVE_OVERLAY_FRAME_NAME } from "./VireoResponsiveOverlayFrame.identity";
import type { VireoResponsiveOverlayFrameProps } from "./VireoResponsiveOverlayFrame.types";
import { SIDE_PANEL_WIDTH_CSS_VAR } from "@/capabilities/overlays/constants/overlay.constants";
import { VireoOverlayHeader } from "@/capabilities/overlays/components/overlays/VireoOverlayHeader";
import { Box, Button, Chip, Divider, Stack, ThemeProvider, Typography, createTheme, type Theme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import React from "react";

function Workspace({ onOpen }: { onOpen: () => void }) {
  return (
    <Box component="main" sx={{ flex: 1, minWidth: 0, overflow: "auto", p: 3, bgcolor: "background.default" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="overline" color="primary.main">
            Operations
          </Typography>
          <Typography variant="h4">Customer accounts</Typography>
        </Box>
        <Button variant="contained" onClick={onOpen}>
          View customer details
        </Button>
      </Stack>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(140px, 1fr))", gap: 2, mt: 3 }}>
        {[
          ["Active", "248", "success.main"],
          ["Review", "18", "warning.main"],
          ["At risk", "7", "error.main"],
        ].map(([label, value, color]) => (
          <Box
            key={label}
            sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}
          >
            <Box sx={{ width: 28, height: 4, borderRadius: 2, bgcolor: color, mb: 1.5 }} />
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5">{value}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ mt: 3, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}>
        <Typography sx={{ p: 2, fontWeight: 700 }}>Recent customers</Typography>
        <Divider />
        {["Northstar Analytics", "Acme Studio", "Harbor Logistics", "Juniper Labs"].map((customer, index) => (
          <Stack key={customer} direction="row" justifyContent="space-between" sx={{ px: 2, py: 1.5 }}>
            <Typography>{customer}</Typography>
            <Chip label={index === 2 ? "Review" : "Active"} size="small" color={index === 2 ? "warning" : "success"} />
          </Stack>
        ))}
      </Box>
    </Box>
  );
}

function OverlayContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <VireoOverlayHeader title="Customer details" closeLabel="Close customer details" onClose={onClose} />
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 3 }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              CUS-10482
            </Typography>
            <Typography variant="h5">Northstar Analytics</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              Enterprise analytics platform · Zagreb, Croatia
            </Typography>
          </Box>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Account status</Typography>
            <Chip label="Active" size="small" color="success" />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Annual value</Typography>
            <Typography fontWeight={700}>$48,600</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Owner</Typography>
            <Typography fontWeight={600}>Maya Chen</Typography>
          </Stack>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
            <Typography variant="body2">
              This neutral fixture lets each story focus on how the same content moves between responsive overlay
              surfaces.
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained">Edit customer</Button>
      </Stack>
    </>
  );
}

function FrameDemo(args: VireoResponsiveOverlayFrameProps) {
  const [open, setOpen] = React.useState(args.open);

  React.useEffect(() => setOpen(args.open), [args.open]);

  const handleClose = React.useCallback(() => {
    setOpen(false);
    args.onClose();
  }, [args]);

  return (
    <Box sx={{ display: "flex", width: "100%", minWidth: { xs: 0, md: 720 }, height: 560, overflow: "hidden" }}>
      <Workspace onOpen={() => setOpen(true)} />
      <VireoResponsiveOverlayFrame {...args} open={open} onClose={handleClose}>
        <OverlayContent onClose={handleClose} />
      </VireoResponsiveOverlayFrame>
    </Box>
  );
}

const meta: Meta<typeof VireoResponsiveOverlayFrame> = {
  title: "Overlays/Overlays/VireoResponsiveOverlayFrame",
  component: VireoResponsiveOverlayFrame,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Coordinates one content flow across a mobile bottom sheet and configurable desktop dialog or side-panel surfaces.\n\n### Why it exists\n\nResponsive workflows otherwise duplicate breakpoint selection, panel sizing, resize behavior, docked-space fallback, and exit lifecycle wiring every time the same content needs mobile and desktop presentation. Vireo owns that orchestration so consumers can choose intent while the frame keeps surface behavior consistent. Use it when one overlay flow genuinely changes surface by viewport; use a direct dialog, drawer, or docked panel when the surface never needs responsive coordination.",
      },
    },
  },
  args: {
    open: false,
    onClose: fn(),
    onExited: fn(),
    children: <span>Customer details</span>,
  },
  argTypes: {
    onClose: { control: false },
    onExited: { control: false },
    children: { control: false },
    desktopPaperSx: { control: false },
    desktopSidePanelSx: { control: false },
    desktopSidePanelWidth: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  render: args => <FrameDemo {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MobileBottomSheet: Story = {
  args: { mobileMaxHeight: "88dvh" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const OverlaySidePanel: Story = {
  args: {
    desktopSurface: "overlaySidePanel",
    desktopSidePanelWidth: 440,
  },
};

export const DockedSidePanel: Story = {
  args: {
    desktopSurface: "dockedSidePanel",
    desktopSidePanelWidth: 420,
    desktopSidePanelMinContentWidth: 360,
  },
};

export const ResizableDockedSidePanel: Story = {
  args: {
    allowSidePanelResize: true,
    desktopSurface: "dockedSidePanel",
    desktopSidePanelWidth: 420,
    desktopSidePanelMinContentWidth: 360,
  },
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

export const Closable: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "View customer details" }));
    await userEvent.click(
      within(canvasElement.ownerDocument.body).getByRole("button", { name: "Close customer details" }),
    );
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const CustomizedRootSlot: Story = {
  args: {
    desktopSurface: "dockedSidePanel",
    desktopSidePanelWidth: 420,
    desktopSidePanelMinContentWidth: 360,
    slots: { root: "section" },
    slotProps: {
      root: ownerState => ({
        "aria-label": "Customized responsive overlay frame",
        "data-surface": ownerState.effectiveDesktopSurface,
      }),
    },
  },
};

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    palette: { primary: { main: "#a78bfa" } },
    components: {
      [VIREO_RESPONSIVE_OVERLAY_FRAME_NAME]: {
        defaultProps: {
          desktopSurface: "overlaySidePanel",
          desktopSidePanelWidth: 460,
          desktopSidePanelSx: {
            borderLeftColor: "#a78bfa",
            borderLeftWidth: 3,
            boxShadow: "-12px 0 32px rgba(0, 0, 0, 0.38)",
          },
        },
      },
    },
  });
}

export const ThemeCustomization: Story = {
  decorators: [
    Story => (
      <ThemeProvider theme={createCustomizedTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};
