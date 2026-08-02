import { RgoIconButton } from "@/components/inputs/RgoIconButton/RgoIconButton";
import {
  RgoIconButtonWithDefaultPropsDemo,
  RgoIconButtonWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoIconButton/stories/RgoIconButtonWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "Stacked icon-over-label action button (88×88). The selected label color follows `theme.palette.text.primary`, so dark-mode handling is automatic via the theme provider — no app-level signal required. The icon can be either a registered [RgoIcon](?path=/docs/components-data-display-rgoicon--docs) name or any `ReactNode`. The `showStatusDot` variant replaces the icon with a small green dot indicator.",
  stories: createStories(STORY_NAMES),
  usage: RgoIconButtonWithDefaultPropsDemoCode,
});

const meta: Meta<typeof RgoIconButton> = {
  title: "Components/Inputs/RgoIconButton",
  component: RgoIconButton,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: { component: DESCRIPTION },
    },
  },
  argTypes: {
    label: { control: "text", description: "Text rendered below the icon." },
    icon: {
      control: false,
      description:
        "Either a registered [RgoIcon](?path=/docs/components-data-display-rgoicon--docs) name or any `ReactNode`.",
    },
    selected: {
      control: "boolean",
      description: "Raises the label color to `theme.palette.text.primary`.",
      table: { defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      description: "Standard MUI `Button` disabled state plus a dimmed label color.",
      table: { defaultValue: { summary: "false" } },
    },
    showStatusDot: {
      control: "boolean",
      description: "Renders a green status dot in place of the icon.",
      table: { defaultValue: { summary: "false" } },
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "error", "warning", "info", "inherit"],
      description: "Forwarded to the underlying MUI `Button`.",
    },
    onClick: { control: false, description: "`() => void`." },
    rgoSlotProps: {
      control: false,
      description: "Per-slot prop overrides: `root`, `rootContent`, `rootContentIcon`, `rootContentStatusDot`, `label`.",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoIconButtonWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: { story: "Selectable group, disabled state, and the status-dot variant." },
      source: { code: RgoIconButtonWithDefaultPropsDemoCode },
    },
  },
};
