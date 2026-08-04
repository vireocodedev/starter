import { RgoTimeWithDateDisplayInline } from "@/components/data-display/RgoTimeWithDateDisplayInline/RgoTimeWithDateDisplayInline";
import {
  RgoTimeWithDateDisplayInlineWithDefaultPropsDemo,
  RgoTimeWithDateDisplayInlineWithDefaultPropsDemoCode,
} from "@/components/data-display/RgoTimeWithDateDisplayInline/stories/RgoTimeWithDateDisplayInlineWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    'Single-line timestamp display: time and date joined by a separator (defaults to `•`). Inherits from MUI `Typography`, so any `variant`, `color`, `sx`, etc. can be passed through. When `timestamp` is `null`/`undefined`, renders the `fallback` (defaults to `"-"`).',
  stories: createStories(STORY_NAMES),
  usage: RgoTimeWithDateDisplayInlineWithDefaultPropsDemoCode,
});

const meta: Meta<typeof RgoTimeWithDateDisplayInline> = {
  title: "Components/Data display/RgoTimeWithDateDisplayInline",
  component: RgoTimeWithDateDisplayInline,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: { component: DESCRIPTION },
    },
  },
  argTypes: {
    timestamp: {
      control: "number",
      description: "Unix epoch timestamp in milliseconds. `null`/`undefined` renders the fallback.",
      table: { type: { summary: "number | null | undefined" } },
    },
    fallback: {
      control: "text",
      description: "Rendered when `timestamp` is nullish.",
      table: { defaultValue: { summary: '"-"' } },
    },
    separator: {
      control: "text",
      description: "String rendered between the time and the date.",
      table: { defaultValue: { summary: '"•"' } },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoTimeWithDateDisplayInlineWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Default style, custom separator, custom Typography props, and the null + custom-fallback variant.",
      },
      source: { code: RgoTimeWithDateDisplayInlineWithDefaultPropsDemoCode },
    },
  },
};
