import { VireoDockedSidePanel } from "./VireoDockedSidePanel";
import { VIREO_DOCKED_SIDE_PANEL_NAME } from "./VireoDockedSidePanel.identity";
import type { VireoDockedSidePanelProps } from "./VireoDockedSidePanel.types";
import { SIDE_PANEL_WIDTH_CSS_VAR } from "@/capabilities/overlays/constants/overlay.constants";
import { VireoOverlayHeader } from "@/capabilities/overlays/components/overlays/VireoOverlayHeader";
import { VireoSidePanelResizeHandle } from "@/capabilities/overlays/components/overlays/VireoSidePanelResizeHandle";
import { useSidePanelResize } from "@/capabilities/overlays/hooks/useSidePanelResize/useSidePanelResize";
import { Box, Button, Chip, Divider, Stack, ThemeProvider, Typography, createTheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, fn, waitFor, within } from "storybook/test";

const INITIAL_WIDTH = 420;
const MIN_WIDTH = 280;
const MAX_WIDTH = 620;

function WorkspaceCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <Box sx={{ minWidth: 0, border: 1, borderColor: "divider", borderRadius: 2, p: 2, bgcolor: "background.paper" }}>
      <Box sx={{ width: 28, height: 4, mb: 1.5, borderRadius: 4, bgcolor: accent }} />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" sx={{ mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
}

function DockedSidePanelDemo(args: VireoDockedSidePanelProps) {
  const resize = useSidePanelResize({
    enabled: true,
    initialWidth: INITIAL_WIDTH,
    minWidth: args.minWidth,
    maxWidth: args.maxWidth,
  });
  const panelStyle = {
    ...args.style,
    [SIDE_PANEL_WIDTH_CSS_VAR]: `${resize.width}px`,
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        minWidth: 720,
        height: 520,
        overflow: "hidden",
        bgcolor: "grey.50",
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Box component="main" sx={{ flex: 1, minWidth: 0, overflow: "auto", p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="overline" color="primary.main">
              Finance workspace
            </Typography>
            <Typography variant="h4">August overview</Typography>
          </Box>
          <Button variant="contained">New invoice</Button>
        </Stack>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(120px, 1fr))", gap: 2, mt: 3 }}>
          <WorkspaceCard label="Revenue" value="$48,240" accent="success.main" />
          <WorkspaceCard label="Outstanding" value="$12,810" accent="warning.main" />
          <WorkspaceCard label="Overdue" value="$2,460" accent="error.main" />
        </Box>

        <Box sx={{ mt: 3, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}>
          <Typography variant="subtitle1" sx={{ px: 2, py: 1.5, fontWeight: 700 }}>
            Recent activity
          </Typography>
          <Divider />
          {["Acme Studio paid INV-1842", "Northstar opened INV-1849", "Quarterly report exported"].map(
            (activity, index) => (
              <Stack key={activity} direction="row" justifyContent="space-between" sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2">{activity}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {index + 1}h ago
                </Typography>
              </Stack>
            ),
          )}
        </Box>
      </Box>

      <VireoDockedSidePanel
        {...args}
        ref={resize.rootRef}
        data-testid="docked-side-panel"
        width={`var(${SIDE_PANEL_WIDTH_CSS_VAR})`}
        isResizing={args.isResizing === true || resize.isResizing}
        style={panelStyle}
        resizeHandle={
          <VireoSidePanelResizeHandle
            isResizing={resize.isResizing}
            onResizeStart={resize.onResizeStart}
            onResizeDoubleClick={resize.onResizeDoubleClick}
          />
        }
      >
        <VireoOverlayHeader
          title="Invoice details"
          actions={
            <Chip label={`${resize.width}px wide`} size="small" color={resize.isResizing ? "primary" : "default"} />
          }
        />
        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                INV-2026-001849
              </Typography>
              <Typography variant="h5">Northstar Analytics</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                Drag the panel edge to resize it. Double-click the handle to restore its initial width.
              </Typography>
            </Box>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Status</Typography>
              <Chip label="Awaiting payment" size="small" color="warning" />
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Due date</Typography>
              <Typography fontWeight={600}>28 Aug 2026</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Total</Typography>
              <Typography fontWeight={700}>$4,860.00</Typography>
            </Stack>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}>{args.children}</Box>
          </Stack>
        </Box>
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          sx={{ p: 2, borderTop: 1, borderColor: "divider" }}
        >
          <Button>Download</Button>
          <Button variant="contained">Send reminder</Button>
        </Stack>
      </VireoDockedSidePanel>
    </Box>
  );
}

const meta: Meta<typeof VireoDockedSidePanel> = {
  title: "Overlays/Overlays/VireoDockedSidePanel",
  component: VireoDockedSidePanel,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Provides an adjacent desktop overlay surface that reserves layout space while coordinating entry, exit, and resize transitions.\n\n### Why it exists\n\nDocked side panels must keep the surrounding layout, the visible surface, pointer resizing, and exit lifecycle synchronized. Centralizing that behavior prevents feature-level panels from implementing subtly different widths, motion, and cleanup semantics. Use it for persistent desktop panels beside primary content; use a drawer or modal surface when content should overlay the workspace instead of resizing it.",
      },
    },
  },
  args: {
    open: true,
    width: INITIAL_WIDTH,
    minWidth: MIN_WIDTH,
    maxWidth: MAX_WIDTH,
    onExited: fn(),
    children: (
      <Typography variant="body2">
        The customer viewed this invoice yesterday. No reminder has been sent yet.
      </Typography>
    ),
  },
  argTypes: {
    width: { control: false },
    minWidth: { control: { type: "number", min: 200, max: 500, step: 10 } },
    maxWidth: { control: { type: "number", min: 400, max: 800, step: 10 } },
    resizeHandle: { control: false },
    onExited: { control: false },
    children: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  render: args => <DockedSidePanelDemo {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ActiveResizeFeedback: Story = {
  args: { isResizing: true },
};

export const LongContent: Story = {
  args: {
    children: (
      <Stack spacing={1}>
        <Typography variant="body2">The customer viewed this invoice yesterday.</Typography>
        <Typography variant="body2">Payment terms: net 30 days.</Typography>
        <Typography variant="body2">Account owner: Maya Chen.</Typography>
      </Stack>
    ),
  },
};

export const PointerResizeAndReset: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole("presentation");

    fireEvent.mouseDown(handle, { clientX: 800, detail: 1 });
    fireEvent.mouseMove(window, { clientX: 700 });
    fireEvent.mouseUp(window);
    await waitFor(() => expect(canvas.getByText("520px wide")).toBeInTheDocument());

    fireEvent.doubleClick(handle);
    await waitFor(() => expect(canvas.getByText("420px wide")).toBeInTheDocument());
  },
};

export const CustomizedSlots: Story = {
  args: {
    slots: { root: "section", surface: "section" },
    slotProps: {
      root: ownerState => ({ "data-panel-open": String(ownerState.open) }),
      surface: {
        "aria-label": "Customized invoice details",
        sx: { borderLeftStyle: "dashed", borderLeftWidth: 3 },
      },
    },
  },
};

const customizedTheme = createTheme({
  components: {
    [VIREO_DOCKED_SIDE_PANEL_NAME]: {
      styleOverrides: {
        root: { paddingLeft: 6, backgroundColor: "#ede9fe" },
        surface: { borderLeftColor: "#7c3aed", borderLeftWidth: 3, boxShadow: "-10px 0 30px rgba(76, 29, 149, 0.14)" },
      },
    },
  },
});

export const ThemeCustomization: Story = {
  decorators: [
    Story => (
      <ThemeProvider theme={customizedTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};
