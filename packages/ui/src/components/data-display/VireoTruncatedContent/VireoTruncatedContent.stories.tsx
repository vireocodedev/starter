import { VireoTruncatedContent } from "./VireoTruncatedContent";
import { VIREO_TRUNCATED_CONTENT_NAME } from "./VireoTruncatedContent.identity";
import { Box, Stack, ThemeProvider, Typography, createTheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

const PREVIEW_WIDTH = 360;

const richContent = (
  <Stack spacing={1}>
    <Typography fontWeight={700}>Rich React content is supported.</Typography>
    <Typography variant="body2">
      The component measures the rendered result rather than assuming its children are plain text. It can therefore
      collapse typography, status details, links, or other compact read-only content.
    </Typography>
    <Typography color="text.secondary" variant="body2">
      Resize the Storybook canvas to see overflow detection respond to the available width.
    </Typography>
  </Stack>
);

const meta: Meta<typeof VireoTruncatedContent> = {
  title: "Components/Data Display/VireoTruncatedContent",
  component: VireoTruncatedContent,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Collapses rendered React content when it exceeds the available height or width and exposes the complete content through an accessible disclosure control.\n\n### Why it exists\n\nDense interfaces need compact previews, but CSS truncation alone can permanently hide rich or multiline content. This component combines overflow detection, constrained presentation, and accessible expansion without requiring each consumer to rebuild that behavior. Use it when the complete content must remain available on demand; use permanent ellipsis when disclosure is unnecessary.",
      },
    },
  },
  args: {
    expandLabel: "Show more",
    collapseLabel: "Show less",
  },
  argTypes: {
    children: { control: false },
    collapsedHeight: { control: { type: "number", min: 1 } },
    expandLabel: { control: "text" },
    collapseLabel: { control: "text" },
    onExpandedChange: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  decorators: [
    Story => (
      <Box width={PREVIEW_WIDTH} maxWidth="100%">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "A short piece of content remains fully visible and does not render an unnecessary disclosure control.",
  },
};

export const OverflowingRichContent: Story = {
  args: {
    children: richContent,
    collapsedHeight: 72,
    onExpandedChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const expandToggle = await canvas.findByRole("button", { name: "Show more" });
    await expect(expandToggle).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(expandToggle);
    await expect(canvas.getByRole("button", { name: "Show less" })).toHaveAttribute("aria-expanded", "true");
    await expect(args.onExpandedChange).toHaveBeenLastCalledWith(true);

    await userEvent.click(canvas.getByRole("button", { name: "Show less" }));
    await expect(canvas.getByRole("button", { name: "Show more" })).toHaveAttribute("aria-expanded", "false");
    await expect(args.onExpandedChange).toHaveBeenLastCalledWith(false);
  },
};

export const InitiallyExpanded: Story = {
  args: {
    children: richContent,
    collapsedHeight: 72,
    defaultExpanded: true,
  },
};

export const HorizontalOverflow: Story = {
  args: {
    children: "INV-2026-000184-CUSTOMER-REFERENCE-WITHOUT-BREAK-OPPORTUNITIES",
    collapsedHeight: 40,
    slotProps: {
      content: {
        sx: {
          fontFamily: "monospace",
          whiteSpace: "nowrap",
        },
      },
    },
  },
  decorators: [
    Story => (
      <Box width={280} maxWidth="100%">
        <Story />
      </Box>
    ),
  ],
};

export const CustomizedSlots: Story = {
  args: {
    children: richContent,
    collapsedHeight: 72,
    slots: {
      root: "section",
      viewport: "article",
    },
    slotProps: {
      root: {
        "aria-label": "Customized expandable summary",
        sx: { border: 1, borderColor: "primary.main", borderRadius: 2, p: 2 },
      },
      viewport: ownerState => ({
        "data-expanded": String(ownerState.expanded),
        sx: { borderInlineStart: 3, borderColor: "primary.light", paddingInlineStart: 1.5 },
      }),
      content: {
        sx: { color: "text.secondary" },
      },
      toggle: {
        color: "secondary",
      },
    },
  },
};

const customizedTheme = createTheme({
  components: {
    [VIREO_TRUNCATED_CONTENT_NAME]: {
      defaultProps: {
        collapsedHeight: 56,
      },
      styleOverrides: {
        root: {
          padding: 16,
          border: "1px solid #7c3aed",
          borderRadius: 12,
          backgroundColor: "#171225",
        },
        viewport: {
          borderRadius: 6,
        },
        content: {
          color: "#ddd6fe",
        },
        toggle: {
          color: "#c4b5fd",
          fontWeight: 700,
        },
      },
    },
  },
});

export const ThemeCustomization: Story = {
  args: {
    children: richContent,
  },
  decorators: [
    Story => (
      <ThemeProvider theme={customizedTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};
