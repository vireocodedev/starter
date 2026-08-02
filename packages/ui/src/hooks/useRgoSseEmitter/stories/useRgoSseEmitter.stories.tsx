import {
  UseSseEmitterWithDefaultPropsDemo,
  UseSseEmitterWithDefaultPropsDemoCode,
} from "@/hooks/useRgoSseEmitter/stories/UseRgoSseEmitterWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "A custom React hook that manages a Server-Sent Events (SSE) connection. Accepts typed event handlers, lifecycle callbacks (`onOpen`, `onMessage`, `onError`), and exposes a `reconnect` function. Automatically closes the connection on unmount or when disabled.",
  stories: createStories(STORY_NAMES),
  usage: UseSseEmitterWithDefaultPropsDemoCode,
});

const meta: Meta = {
  title: "Hooks/useRgoSseEmitter",
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
  render: () => <UseSseEmitterWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the useRgoSseEmitter hook API with simulated connection status and messages. A real SSE server endpoint is required for a live connection.",
      },
      source: {
        code: UseSseEmitterWithDefaultPropsDemoCode,
      },
    },
  },
};
