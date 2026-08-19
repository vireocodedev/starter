import { VireoOverlayHeader } from "./VireoOverlayHeader";
import { VIREO_OVERLAY_HEADER_NAME } from "./VireoOverlayHeader.identity";
import type { VireoOverlayHeaderCloseProps, VireoOverlayHeaderOwnProps } from "./VireoOverlayHeader.types";
import ArrowBack from "@mui/icons-material/ArrowBack";
import MoreVert from "@mui/icons-material/MoreVert";
import { Box, Button, Chip, IconButton, ThemeProvider, createTheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

type VireoOverlayHeaderStoryArgs = VireoOverlayHeaderOwnProps & {
  [TPropName in keyof VireoOverlayHeaderCloseProps]?: VireoOverlayHeaderCloseProps[TPropName];
};

const meta: Meta<typeof VireoOverlayHeader> = {
  title: "Components/Overlay/VireoOverlayHeader",
  component: VireoOverlayHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Provides the standard header anatomy for Vireo dialogs, drawers, bottom sheets, and side panels.\n\n### Why it exists\n\nOverlay headers repeatedly need the same title, action, close-control, sticky-layout, and accessibility relationships. Centralizing that anatomy prevents each overlay surface from developing subtly different ordering, labeling, and customization behavior. Use it for Vireo overlay surfaces; an ordinary MUI-only dialog can continue to use DialogTitle.",
      },
    },
  },
  args: {
    title: "Edit invoice",
  },
  argTypes: {
    title: { control: "text" },
    titleId: { control: "text" },
    leadingAction: { control: false },
    actions: { control: false },
    onClose: { control: false },
    closeLabel: { control: "text" },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  decorators: [
    Story => (
      <Box sx={{ width: "100%", border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Story />
        <Box sx={{ minHeight: 160, p: 3, color: "text.secondary" }}>Overlay content starts here.</Box>
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<VireoOverlayHeaderStoryArgs>;

export const Default: Story = {};

export const CompleteAnatomy: Story = {
  args: {
    leadingAction: (
      <IconButton aria-label="Back">
        <ArrowBack />
      </IconButton>
    ),
    actions: (
      <>
        <Chip label="Draft" size="small" />
        <Button size="small">Save</Button>
      </>
    ),
    closeLabel: "Close invoice editor",
    onClose: fn(),
  },
};

export const Closable: Story = {
  args: {
    closeLabel: "Close invoice editor",
    onClose: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Close invoice editor" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const DisabledClose: Story = {
  args: {
    closeDisabled: true,
    closeLabel: "Close while saving",
    onClose: fn(),
  },
};

export const NonSticky: Story = {
  args: {
    sticky: false,
  },
  decorators: [
    Story => (
      <Box sx={{ height: 160, overflowY: "auto" }}>
        <Story />
      </Box>
    ),
  ],
};

export const LongTitle: Story = {
  args: {
    title: "Edit invoice INV-2026-000184 for a customer whose company name is deliberately long enough to wrap",
    actions: <Chip label="Unsaved changes" size="small" color="warning" />,
    closeLabel: "Close invoice editor",
    onClose: fn(),
  },
};

export const CustomizedSlots: Story = {
  args: {
    actions: <Chip label="Customized" size="small" />,
    closeLabel: "Close customized overlay",
    onClose: fn(),
    slots: {
      root: "section",
      closeIcon: MoreVert,
    },
    slotProps: {
      root: {
        "aria-label": "Customized overlay header",
        sx: { borderBottomStyle: "dashed" },
      },
      title: {
        sx: { color: "primary.main", fontWeight: 700 },
      },
      closeButton: {
        color: "primary",
      },
    },
  },
};

const customizedTheme = createTheme({
  components: {
    [VIREO_OVERLAY_HEADER_NAME]: {
      defaultProps: {
        sticky: false,
      },
      styleOverrides: {
        root: {
          borderBottomWidth: 3,
          borderBottomColor: "#7c3aed",
        },
        title: {
          color: "#7c3aed",
          fontWeight: 700,
        },
        closeButton: {
          borderRadius: 4,
        },
      },
    },
  },
});

export const ThemeCustomization: Story = {
  args: {
    closeLabel: "Close themed overlay",
    onClose: fn(),
  },
  decorators: [
    Story => (
      <ThemeProvider theme={customizedTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};
