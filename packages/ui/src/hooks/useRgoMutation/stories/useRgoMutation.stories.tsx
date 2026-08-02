import {
  UseMutationBasicWithDefaultPropsDemo,
  UseMutationBasicWithDefaultPropsDemoCode,
} from "@/hooks/useRgoMutation/stories/UseRgoMutationWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "A wrapper around TanStack Query's `useMutation` that automatically shows snackbar notifications on success and error. Accepts static strings or functions that derive the message from the response or error.",
  stories: createStories(STORY_NAMES),
  usage: UseMutationBasicWithDefaultPropsDemoCode,
});

const meta: Meta = {
  title: "Hooks/useRgoMutation",
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
  render: () => <UseMutationBasicWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Simulates a mutation lifecycle with success and error states. In real usage, snackbar notifications appear automatically based on the `messageSuccess` and `messageError` props.",
      },
      source: {
        code: UseMutationBasicWithDefaultPropsDemoCode,
      },
    },
  },
};
