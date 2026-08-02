import {
  UseDebounceWithDefaultPropsDemo,
  UseDebounceWithDefaultPropsDemoCode,
} from "@/hooks/useRgoDebounce/stories/UseRgoDebounceWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "A custom React hook for debouncing function calls. It delays the execution of a callback until after a specified delay has elapsed since the last invocation, which is useful for search inputs, resize handlers, and other high-frequency events.",
  stories: createStories(STORY_NAMES),
  usage: UseDebounceWithDefaultPropsDemoCode,
});

const meta: Meta = {
  title: "Hooks/useRgoDebounce",
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
  render: () => <UseDebounceWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Debounced search input that updates the debounced value only after 500ms of inactivity.",
      },
      source: {
        code: UseDebounceWithDefaultPropsDemoCode,
      },
    },
  },
};
