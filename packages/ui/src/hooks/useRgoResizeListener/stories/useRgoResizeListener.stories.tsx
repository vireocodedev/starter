import {
  UseResizeListenerWithDefaultPropsDemo,
  UseResizeListenerWithDefaultPropsDemoCode,
} from "@/hooks/useRgoResizeListener/stories/UseRgoResizeListenerWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "A custom React hook that listens for the window `resize` event and invokes a callback whenever the window is resized. Automatically removes the event listener on unmount.",
  stories: createStories(STORY_NAMES),
  usage: UseResizeListenerWithDefaultPropsDemoCode,
});

const meta: Meta = {
  title: "Hooks/useRgoResizeListener",
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
  render: () => <UseResizeListenerWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Displays the current window dimensions, updating in real-time as the window is resized.",
      },
      source: {
        code: UseResizeListenerWithDefaultPropsDemoCode,
      },
    },
  },
};
