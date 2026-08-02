import { RgoStatusDot } from "@/components/data-display/RgoStatusDot/RgoStatusDot";
import {
  RgoStatusDotWithDefaultPropsDemo,
  RgoStatusDotWithDefaultPropsDemoCode,
} from "@/components/data-display/RgoStatusDot/stories/RgoStatusDotWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "A small colored dot used as a compact status indicator. Maps a semantic `color` to a MUI palette token; the optional `selected` flag inverts the dot to white for use on solid/colored backgrounds.",
  stories: createStories(STORY_NAMES),
  usage: RgoStatusDotWithDefaultPropsDemoCode,
});

const meta: Meta<typeof RgoStatusDot> = {
  title: "Components/Data display/RgoStatusDot",
  component: RgoStatusDot,
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
      description: "Semantic color of the dot.",
      table: { type: { summary: '"success" | "error" | "warning" | "info" | "standard"' } },
    },
    selected: {
      control: "boolean",
      description: "Inverts the dot to white. Use on dark/colored backgrounds where the standard color would not be visible.",
      table: { defaultValue: { summary: "false" } },
    },
    marginLeft: {
      control: "number",
      description: "MUI spacing units of left margin.",
    },
    marginRight: {
      control: "number",
      description: "MUI spacing units of right margin.",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoStatusDotWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: { story: "Each available color, plus the `selected` (inverted) variant on a colored background." },
      source: { code: RgoStatusDotWithDefaultPropsDemoCode },
    },
  },
};
