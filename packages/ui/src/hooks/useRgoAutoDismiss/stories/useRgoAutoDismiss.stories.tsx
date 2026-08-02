import {
  UseAutoDismissWithDefaultPropsDemo,
  UseAutoDismissWithDefaultPropsDemoCode,
} from "@/hooks/useRgoAutoDismiss/stories/UseRgoAutoDismissWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "A custom React hook that manages an auto-dismiss timer with progress tracking. Supports start, clear, pause, and resume controls. The timer reports remaining progress as a percentage (100 → 0) and calls `onDismiss` when it reaches zero.",
  stories: createStories(STORY_NAMES),
  usage: UseAutoDismissWithDefaultPropsDemoCode,
});

const meta: Meta = {
  title: "Hooks/useRgoAutoDismiss",
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
  render: () => <UseAutoDismissWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "A notification that auto-dismisses after 5 seconds with a progress bar. Hover the notification to pause the timer, move away to resume.",
      },
      source: {
        code: UseAutoDismissWithDefaultPropsDemoCode,
      },
    },
  },
};
