import { RgoInputDuration } from "@/components/inputs/RgoInputDuration/RgoInputDuration";
import {
  RgoInputDurationWithCustomViewsDemo,
  RgoInputDurationWithCustomViewsDemoCode,
} from "@/components/inputs/RgoInputDuration/stories/RgoInputDurationWithCustomViewsDemo";
import {
  RgoInputDurationWithDefaultPropsDemo,
  RgoInputDurationWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoInputDuration/stories/RgoInputDurationWithDefaultPropsDemo";
import {
  RgoInputDurationWithDisabledDemo,
  RgoInputDurationWithDisabledDemoCode,
} from "@/components/inputs/RgoInputDuration/stories/RgoInputDurationWithDisabledDemo";
import {
  RgoInputDurationWithErrorDemo,
  RgoInputDurationWithErrorDemoCode,
} from "@/components/inputs/RgoInputDuration/stories/RgoInputDurationWithErrorDemo";
import {
  RgoInputDurationWithFormInputDemo,
  RgoInputDurationWithFormInputDemoCode,
} from "@/components/inputs/RgoInputDuration/stories/RgoInputDurationWithFormInputDemo";
import {
  RgoInputDurationWithHelperTextDemo,
  RgoInputDurationWithHelperTextDemoCode,
} from "@/components/inputs/RgoInputDuration/stories/RgoInputDurationWithHelperTextDemo";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription, storybookInputComponentArgTypes } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORYBOOK_COMPONENT = RgoInputDuration;
const STORYBOOK_TITLE = "Components/Inputs/RgoInputDuration";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const STORYBOOK_USAGE_CODE = RgoInputDurationWithDefaultPropsDemoCode;
const INPUT_DESCRIPTION =
  "A duration input component using MUI TimeField. Converts between a numeric duration value and a time display (HH:MM or HH:MM:SS).";
const INPUT_VALUE_DESCRIPTION = "The duration value as a number (in the configured duration unit) or null";
const INPUT_VALUE_TYPE = "number | null";
const INPUT_SLOT_NAMES = ["root"];
const STORY_NAMES = [
  "With default props",
  "With helper text",
  "With error",
  "With disabled",
  "With custom views",
  "With form input",
];

const meta: Meta<typeof STORYBOOK_COMPONENT> = {
  title: STORYBOOK_TITLE,
  component: STORYBOOK_COMPONENT,
  parameters: {
    docs: {
      description: {
        component: createStorybookDescription({
          badge: STORYBOOK_BADGE,
          description: INPUT_DESCRIPTION,
          usage: STORYBOOK_USAGE_CODE,
          stories: createStories(STORY_NAMES),
        }),
      },
    },
  },
  argTypes: {
    ...storybookInputComponentArgTypes({
      valueDescription: INPUT_VALUE_DESCRIPTION,
      valueType: INPUT_VALUE_TYPE,
      slotNames: INPUT_SLOT_NAMES,
    }),
    durationUnit: {
      control: "select",
      options: ["hours", "minutes", "seconds"],
      description: "The unit used for the numeric value",
      table: {
        defaultValue: { summary: '"minutes"' },
        type: { summary: '"hours" | "minutes" | "seconds"' },
      },
    },
    durationViews: {
      control: false,
      description: "The time views to display",
      table: {
        defaultValue: { summary: '["hours", "minutes"]' },
        type: { summary: "readonly TimeView[]" },
      },
    },
    startAdornment: {
      control: false,
      description: "Optional start adornment",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
    endAdornment: {
      control: false,
      description: "Optional end adornment",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  args: {
    disabled: false,
    error: false,
    helperText: "",
  },
  render: args => <RgoInputDurationWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoInputDurationWithDefaultPropsDemoCode,
      },
      description: {
        story: "Duration input with default props (HH:MM format, minutes unit).",
      },
    },
  },
};

export const WithHelperText: Story = {
  name: "With helper text",
  args: {
    disabled: false,
    error: false,
    helperText: "",
  },
  render: args => <RgoInputDurationWithHelperTextDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Duration input with a helper text message displayed below the field.",
      },
      source: {
        code: RgoInputDurationWithHelperTextDemoCode,
      },
    },
  },
};

export const WithError: Story = {
  name: "With error",
  args: {
    disabled: false,
    error: true,
    helperText: "",
  },
  render: args => <RgoInputDurationWithErrorDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Duration input in error state with an error message.",
      },
      source: {
        code: RgoInputDurationWithErrorDemoCode,
      },
    },
  },
};

export const WithDisabled: Story = {
  name: "With disabled",
  args: {
    disabled: true,
    error: false,
    helperText: "",
  },
  render: args => <RgoInputDurationWithDisabledDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Duration input in disabled state.",
      },
      source: {
        code: RgoInputDurationWithDisabledDemoCode,
      },
    },
  },
};

export const WithCustomViews: Story = {
  name: "With custom views",
  args: {
    disabled: false,
    error: false,
    helperText: "",
  },
  render: args => <RgoInputDurationWithCustomViewsDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Duration input with hours, minutes, and seconds views using seconds as the unit.",
      },
      source: {
        code: RgoInputDurationWithCustomViewsDemoCode,
      },
    },
  },
};

export const WithFormInput: Story = {
  name: "With form input",
  args: {
    disabled: false,
    error: false,
    helperText: "",
  },
  render: args => <RgoInputDurationWithFormInputDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Duration input integrated with React Hook Form and Zod validation.",
      },
      source: {
        code: RgoInputDurationWithFormInputDemoCode,
      },
    },
  },
};
