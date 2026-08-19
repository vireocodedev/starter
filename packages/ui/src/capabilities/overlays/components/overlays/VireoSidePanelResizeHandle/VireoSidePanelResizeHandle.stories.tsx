import { VireoSidePanelResizeHandle } from "./VireoSidePanelResizeHandle";
import { VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME } from "./VireoSidePanelResizeHandle.identity";
import { Box, ThemeProvider, createTheme, type Theme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

const meta: Meta<typeof VireoSidePanelResizeHandle> = {
  title: "Overlays/Overlays/VireoSidePanelResizeHandle",
  component: VireoSidePanelResizeHandle,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Provides the standard pointer interaction target and visual feedback for resizing Vireo side panels.\n\n### Why it exists\n\nResizable overlay panels need a forgiving hit area, consistent hover and active feedback, and predictable event composition without each frame rebuilding those details. Vireo owns that shared overlay anatomy so panels behave and theme consistently. Use it with Vireo side-panel resizing; use a keyboard-operable separator or full split-pane control when resizing is itself a standalone accessible interaction.",
      },
    },
  },
  args: {
    onResizeStart: fn(),
    onResizeDoubleClick: fn(),
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
    onResizeStart: { control: false },
    onResizeDoubleClick: { control: false },
  },
  decorators: [
    Story => (
      <Box
        sx={{
          position: "relative",
          width: 360,
          height: 240,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Story />
        <Box sx={{ p: 3, color: "text.secondary" }}>Side-panel content</Box>
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Resizing: Story = { args: { isResizing: true } };

export const PointerInteractions: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole("presentation");
    await userEvent.pointer({ keys: "[MouseLeft]", target: handle });
    await expect(args.onResizeStart).toHaveBeenCalledOnce();
    await userEvent.dblClick(handle);
    await expect(args.onResizeDoubleClick).toHaveBeenCalledOnce();
  },
};

export const CustomizedSlots: Story = {
  args: {
    slots: { root: "section" },
    slotProps: {
      root: ownerState => ({
        "data-resizing": String(ownerState.isResizing),
        sx: { width: 20, "&::after": { width: 10 } },
      }),
    },
  },
};

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      [VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME]: {
        styleOverrides: {
          root: { "&::after": { backgroundColor: "#a78bfa", opacity: 0.65 } },
          resizing: { "&::after": { backgroundColor: "#f472b6", opacity: 1 } },
        },
      },
    },
  });
}

export const ThemeCustomization: Story = {
  args: { isResizing: true },
  decorators: [
    Story => (
      <ThemeProvider theme={createCustomizedTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};
