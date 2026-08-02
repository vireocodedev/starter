import { RgoTimeWithDateDisplay } from "@/components/data-display/RgoTimeWithDateDisplay/RgoTimeWithDateDisplay";
import {
  RgoTimeWithDateDisplayWithDefaultPropsDemo,
  RgoTimeWithDateDisplayWithDefaultPropsDemoCode,
} from "@/components/data-display/RgoTimeWithDateDisplay/stories/RgoTimeWithDateDisplayWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "Two-line timestamp display: the time formatted on top in a bolder/larger style, and the date below in a smaller, dimmed style. When `timestamp` is `null`/`undefined`, renders the `fallback` (defaults to `\"-\"`). Both the root and the time/date `<span>`s expose `slotProps` for styling overrides.",
  stories: createStories(STORY_NAMES),
  usage: RgoTimeWithDateDisplayWithDefaultPropsDemoCode,
});

const meta: Meta<typeof RgoTimeWithDateDisplay> = {
  title: "Components/Data display/RgoTimeWithDateDisplay",
  component: RgoTimeWithDateDisplay,
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
    slotProps: {
      control: false,
      description: "Override props for the `root` Box and the `timeText` / `dateText` spans.",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoTimeWithDateDisplayWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: { story: "Several timestamps plus the `null` + custom-fallback variants." },
      source: { code: RgoTimeWithDateDisplayWithDefaultPropsDemoCode },
    },
  },
};
