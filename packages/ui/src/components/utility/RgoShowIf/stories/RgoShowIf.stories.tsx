import { RgoShowIf } from "@/components/utility/RgoShowIf/RgoShowIf";
import {
  RgoShowIfWithDefaultPropsDemo,
  RgoShowIfWithDefaultPropsDemoCode,
} from "@/components/utility/RgoShowIf/stories/RgoShowIfWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    'A self-documenting conditional render gate. Use for permission checks, feature flags, and any other "show this only if…" pattern that you want explicit at the call site. Permission/flag resolution is the caller\'s job — pass a boolean or a function returning a boolean.',
  stories: createStories(STORY_NAMES),
  usage: RgoShowIfWithDefaultPropsDemoCode,
});

const meta: Meta<typeof RgoShowIf> = {
  title: "Components/Utility/RgoShowIf",
  component: RgoShowIf,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: { component: DESCRIPTION },
    },
  },
  argTypes: {
    when: {
      control: false,
      description:
        "Render `children` when this is `true` (or when the function returns `true`). Pass a function only when the predicate is expensive and you want to defer it until render time.",
      table: { type: { summary: "boolean | (() => boolean)" } },
    },
    fallback: {
      control: false,
      description: "Optional node rendered when `when` is falsy.",
      table: { defaultValue: { summary: "null" } },
    },
    children: {
      control: false,
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoShowIfWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: { story: "Boolean form with and without `fallback`, plus the function-predicate form." },
      source: { code: RgoShowIfWithDefaultPropsDemoCode },
    },
  },
};
