import { VireoBottomDrawer } from "./VireoBottomDrawer";
import { VIREO_BOTTOM_DRAWER_NAME } from "./VireoBottomDrawer.identity";
import { VireoOverlayHeader } from "@/capabilities/overlays/components/overlays/VireoOverlayHeader";
import { Box, Button, Chip, Stack, ThemeProvider, Typography, createTheme, type Theme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import React from "react";

function DrawerContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <VireoOverlayHeader title="Filter customers" closeLabel="Close filters" onClose={onClose} />
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Choose the customer states shown in the workspace.
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip label="Active" color="success" />
          <Chip label="Needs review" color="warning" />
          <Chip label="At risk" color="error" />
        </Stack>
        <Button variant="contained">Apply filters</Button>
      </Stack>
    </>
  );
}

function BottomDrawerDemo(args: React.ComponentProps<typeof VireoBottomDrawer>) {
  const [open, setOpen] = React.useState(args.open);

  React.useEffect(() => setOpen(args.open), [args.open]);

  const handleClose = React.useCallback(() => {
    setOpen(false);
    args.onClose();
  }, [args]);

  const handleOpen = React.useCallback(() => {
    setOpen(true);
    args.onOpen?.();
  }, [args]);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open customer filters
      </Button>
      <VireoBottomDrawer {...args} open={open} onClose={handleClose} onOpen={handleOpen}>
        <DrawerContent onClose={handleClose} />
      </VireoBottomDrawer>
    </>
  );
}

const meta: Meta<typeof VireoBottomDrawer> = {
  title: "Overlays/Overlays/VireoBottomDrawer",
  component: VireoBottomDrawer,
  tags: ["autodocs"],
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        component:
          "Provides the standard swipeable mobile bottom-sheet surface, puller, sizing, and lifecycle wiring.\n\n### Why it exists\n\nMobile workflows repeatedly need the same bottom anchoring, safe swipe configuration, grab-handle anatomy, rounded paper, backdrop behavior, and fixed-versus-content height rules. Vireo owns that surface so responsive flows do not rebuild subtly different sheets. Use it for mobile bottom sheets; use a dialog or side drawer when swipeable bottom-sheet behavior is not appropriate.",
      },
    },
  },
  args: {
    open: false,
    onClose: fn(),
    onExited: fn(),
  },
  argTypes: {
    onClose: { control: false },
    onOpen: { control: false },
    onExited: { control: false },
    children: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  decorators: [
    Story => (
      <Box sx={{ bgcolor: "background.paper", p: 3 }}>
        <Typography variant="h5">Customer workspace</Typography>
        <Typography color="text.secondary">The bottom sheet remains the subject of this mobile canvas.</Typography>
        <Story />
      </Box>
    ),
  ],
  render: args => <BottomDrawerDemo {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FixedHeight: Story = { args: { height: "72dvh" } };

export const WithoutBackdrop: Story = { args: { useBackdrop: false } };

export const CloseInteraction: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open customer filters" }));
    await expect(within(canvasElement.ownerDocument.body).getByText("Filter customers")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const CustomizedPuller: Story = {
  args: {
    slots: { puller: "header" },
    slotProps: { puller: { "aria-label": "Customized sheet handle", sx: { py: 1.5, "&::after": { width: 56 } } } },
  },
};

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      [VIREO_BOTTOM_DRAWER_NAME]: {
        defaultProps: { useBackdrop: false },
        styleOverrides: { puller: { backgroundColor: "#2e1065", "&::after": { backgroundColor: "#a78bfa" } } },
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
