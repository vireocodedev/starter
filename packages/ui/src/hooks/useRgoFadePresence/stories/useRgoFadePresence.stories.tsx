import {
  UseRgoFadePresenceWithDefaultPropsDemo,
  UseRgoFadePresenceWithDefaultPropsDemoCode,
} from "@/hooks/useRgoFadePresence/stories/UseRgoFadePresenceWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "Manages the visible / fade lifecycle for a nullable value. When `value` becomes non-null the hook flips `visible` to `true`; calling `onDismiss()` flips it back so MUI `Fade` can play the exit animation. `lastValue` is kept populated during the fade-out so the wrapped content keeps rendering its previous value (no snap-to-empty), and `handleExited` notifies the caller once the transition fully completes.",
  stories: createStories(STORY_NAMES),
  usage: UseRgoFadePresenceWithDefaultPropsDemoCode,
});

const meta: Meta = {
  title: "Hooks/useRgoFadePresence",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: { component: DESCRIPTION },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <UseRgoFadePresenceWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: { story: "Selecting an item fades a detail panel in; dismissing fades it out while preserving the last selected value during the transition." },
      source: { code: UseRgoFadePresenceWithDefaultPropsDemoCode },
    },
  },
};
