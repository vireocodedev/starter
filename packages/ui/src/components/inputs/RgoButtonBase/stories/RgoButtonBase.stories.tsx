import { RgoButtonBase } from "@/components/inputs/RgoButtonBase/RgoButtonBase";
import {
  RgoButtonBaseWithDefaultPropsDemo,
  RgoButtonBaseWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoButtonBase/stories/RgoButtonBaseWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "A thin wrapper around MUI `ButtonBase` that picks its background and hover color from a (color, severity) pair on the MUI palette. When no `onClick` is supplied the component degrades into a passive container (no ripple, no pointer cursor, text becomes selectable, removed from the tab order) so it can act as a styled box without losing the ergonomic API.",
  stories: createStories(STORY_NAMES),
  usage: RgoButtonBaseWithDefaultPropsDemoCode,
});

const meta: Meta<typeof RgoButtonBase> = {
  title: "Components/Inputs/RgoButtonBase",
  component: RgoButtonBase,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: { component: DESCRIPTION },
    },
  },
  argTypes: {
    color: {
      control: "select",
      options: ["primary", "error", "grey", "secondary", "info", "success", "warning", "black", "white"],
      description: "MUI palette color used for the background and hover/focus background.",
      table: { defaultValue: { summary: '"grey"' } },
    },
    colorSeverity: {
      control: "select",
      options: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      description: "MUI palette severity (50…900). Hover bumps to the next step (capped at 900). Ignored for `black`/`white`.",
      table: { defaultValue: { summary: "100" } },
    },
    component: {
      control: "text",
      description: "Underlying element/component to render (passed through to MUI `ButtonBase`).",
      table: { defaultValue: { summary: '"div"' } },
    },
    onClick: {
      control: false,
      description: "When omitted the button is non-interactive (no ripple, no pointer cursor, removed from tab order).",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoButtonBaseWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: { story: "All available colors at the default severity, a severity gradient on `primary`, and the non-clickable variant." },
      source: { code: RgoButtonBaseWithDefaultPropsDemoCode },
    },
  },
};
