import {
  UseContainerSizeWithDefaultPropsDemo,
  UseContainerSizeWithDefaultPropsDemoCode,
} from "@/hooks/useRgoContainerSize/stories/UseRgoContainerSizeWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "A custom React hook that tracks the pixel size of a container element via ResizeObserver. Returns the current `width` and `height` and updates automatically when the element is resized.",
  stories: createStories(STORY_NAMES),
  usage: UseContainerSizeWithDefaultPropsDemoCode,
});

const meta: Meta = {
  title: "Hooks/useRgoContainerSize",
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
  render: () => <UseContainerSizeWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Displays the container dimensions, updating in real-time as the container is resized. Drag the bottom-right corner to resize.",
      },
      source: {
        code: UseContainerSizeWithDefaultPropsDemoCode,
      },
    },
  },
};
