import {
  UseInfiniteCanvasWithDefaultPropsDemo,
  UseInfiniteCanvasWithDefaultPropsDemoCode,
} from "@/hooks/useRgoInfiniteCanvas/stories/UseRgoInfiniteCanvasWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "A custom React hook that accesses the `RgoInfiniteCanvas` context, providing the current transform state (`scale`, `pan`) and methods to manipulate it (`setTransform`, `clientToWorld`, `worldToClient`, `toggleFullscreen`). Must be used inside an `RgoInfiniteCanvas` component.",
  stories: createStories(STORY_NAMES),
  usage: UseInfiniteCanvasWithDefaultPropsDemoCode,
});

const meta: Meta = {
  title: "Hooks/useRgoInfiniteCanvas",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <UseInfiniteCanvasWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Accesses canvas context to display transform info and reset the viewport.",
      },
      source: {
        code: UseInfiniteCanvasWithDefaultPropsDemoCode,
      },
    },
  },
};
