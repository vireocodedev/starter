import {
  UseFullscreenListenerWithDefaultPropsDemo,
  UseFullscreenListenerWithDefaultPropsDemoCode,
} from "@/hooks/useRgoFullscreenListener/stories/UseRgoFullscreenListenerWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "A custom React hook that listens for the browser `fullscreenchange` event and invokes a callback whenever the fullscreen state changes. Automatically cleans up the event listener on unmount.",
  stories: createStories(STORY_NAMES),
  usage: UseFullscreenListenerWithDefaultPropsDemoCode,
});

const meta: Meta = {
  title: "Hooks/useRgoFullscreenListener",
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
  render: () => <UseFullscreenListenerWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Tracks fullscreen state changes and displays the current status.",
      },
      source: {
        code: UseFullscreenListenerWithDefaultPropsDemoCode,
      },
    },
  },
};
