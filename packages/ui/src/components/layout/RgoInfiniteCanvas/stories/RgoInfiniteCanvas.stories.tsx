import { RgoInfiniteCanvas } from "@/components/layout/RgoInfiniteCanvas/RgoInfiniteCanvas";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  RgoInfiniteCanvasWithDefaultPropsDemo,
  RgoInfiniteCanvasWithDefaultPropsDemoCode,
} from "./RgoInfiniteCanvasWithDefaultPropsDemo";

const STORYBOOK_TITLE = "Components/Layout/RgoInfiniteCanvas";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const DESCRIPTION =
  "A pannable and zoomable infinite canvas component with grid background. Supports pointer drag panning, mouse wheel zooming, coordinate transforms, and fullscreen toggle via context. Use with `RgoInfiniteCanvasBody` for transformed content and `RgoInfiniteCanvasOverlay` for fixed position UI overlays.";
const STORY_NAMES = ["With default props"];

const meta: Meta<typeof RgoInfiniteCanvas> = {
  title: STORYBOOK_TITLE,
  component: RgoInfiniteCanvas,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: createStorybookDescription({
          badge: STORYBOOK_BADGE,
          description: DESCRIPTION,
          usage: RgoInfiniteCanvasWithDefaultPropsDemoCode,
          stories: createStories(STORY_NAMES),
        }),
      },
    },
  },
  argTypes: {
    children: {
      control: false,
      description: "Canvas content (RgoInfiniteCanvasBody and/or RgoInfiniteCanvasOverlay)",
      table: { type: { summary: "React.ReactNode" } },
    },
    initialScale: {
      control: "number",
      description: "Initial zoom scale",
      table: { defaultValue: { summary: "1" }, type: { summary: "number" } },
    },
    initialPanX: {
      control: "number",
      description: "Initial horizontal pan offset",
      table: { defaultValue: { summary: "0" }, type: { summary: "number" } },
    },
    initialPanY: {
      control: "number",
      description: "Initial vertical pan offset",
      table: { defaultValue: { summary: "0" }, type: { summary: "number" } },
    },
    minScale: {
      control: "number",
      description: "Minimum zoom scale",
      table: { defaultValue: { summary: "0.1" }, type: { summary: "number" } },
    },
    maxScale: {
      control: "number",
      description: "Maximum zoom scale",
      table: { defaultValue: { summary: "10" }, type: { summary: "number" } },
    },
    zoomStep: {
      control: "number",
      description: "Zoom multiplier per scroll step",
      table: { defaultValue: { summary: "1.1" }, type: { summary: "number" } },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoInfiniteCanvasWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "An interactive canvas with positioned elements. Scroll to zoom, drag empty space to pan. Overlay UI stays fixed in the top-right corner.",
      },
      source: {
        code: RgoInfiniteCanvasWithDefaultPropsDemoCode,
      },
    },
  },
};
