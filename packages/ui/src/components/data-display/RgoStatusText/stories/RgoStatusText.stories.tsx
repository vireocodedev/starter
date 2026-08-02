import { RgoStatusText } from "@/components/data-display/RgoStatusText/RgoStatusText";
import {
  RgoStatusTextWithDefaultPropsDemo,
  RgoStatusTextWithDefaultPropsDemoCode,
} from "@/components/data-display/RgoStatusText/stories/RgoStatusTextWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "A small status indicator combining a colored dot ([RgoStatusDot](?path=/docs/components-data-display-rgostatusdot--docs)) with a text label, plus an optional hover popover for additional detail. Useful for connection states, item status badges, etc.",
  stories: createStories(STORY_NAMES),
  usage: RgoStatusTextWithDefaultPropsDemoCode,
});

const meta: Meta<typeof RgoStatusText> = {
  title: "Components/Data display/RgoStatusText",
  component: RgoStatusText,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: { component: DESCRIPTION },
    },
  },
  argTypes: {
    color: {
      control: "select",
      options: ["success", "error", "warning", "info", "standard"],
      description: "Forwarded to the inner [RgoStatusDot](?path=/docs/components-data-display-rgostatusdot--docs).",
    },
    label: {
      control: "text",
      description: "The text rendered next to the status dot.",
    },
    tooltip: {
      control: "text",
      description:
        "Optional content shown in a hover popover. Pass a string/number for a plain text tooltip, or a React node for richer content.",
      table: { type: { summary: "string | number | React.ReactNode" } },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoStatusTextWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: { story: "Common color variants and the optional hover tooltip (string and React-node forms)." },
      source: { code: RgoStatusTextWithDefaultPropsDemoCode },
    },
  },
};
