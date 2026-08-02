import { RgoInputTime } from "@/components/inputs/RgoInputTime/RgoInputTime";
import {
  RgoInputTimeWithDefaultPropsDemo,
  RgoInputTimeWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoInputTime/stories/RgoInputTimeWithDefaultPropsDemo";
import {
  RgoInputTimeWithDisabledDemo,
  RgoInputTimeWithDisabledDemoCode,
} from "@/components/inputs/RgoInputTime/stories/RgoInputTimeWithDisabledDemo";
import {
  RgoInputTimeWithErrorDemo,
  RgoInputTimeWithErrorDemoCode,
} from "@/components/inputs/RgoInputTime/stories/RgoInputTimeWithErrorDemo";
import {
  RgoInputTimeWithFormInputDemo,
  RgoInputTimeWithFormInputDemoCode,
} from "@/components/inputs/RgoInputTime/stories/RgoInputTimeWithFormInputDemo";
import {
  RgoInputTimeWithHelperTextDemo,
  RgoInputTimeWithHelperTextDemoCode,
} from "@/components/inputs/RgoInputTime/stories/RgoInputTimeWithHelperTextDemo";
import {
  RgoInputTimeWithRefDateConstraintsDemo,
  RgoInputTimeWithRefDateConstraintsDemoCode,
} from "@/components/inputs/RgoInputTime/stories/RgoInputTimeWithRefDateConstraintsDemo";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription, storybookInputComponentArgTypes } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORYBOOK_COMPONENT = RgoInputTime;
const STORYBOOK_TITLE = "Components/Inputs/RgoInputTime";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const STORYBOOK_USAGE_CODE = RgoInputTimeWithDefaultPropsDemoCode;
const INPUT_DESCRIPTION =
  "A time picker input component using MUI TimePicker. The value is a timestamp number. Supports optional reference date constraints (refDateMin, refDateMax) for date-part auto-correction.";
const INPUT_VALUE_DESCRIPTION = "The time value as a timestamp number or null";
const INPUT_VALUE_TYPE = "number | null";
const INPUT_SLOT_NAMES = ["root"];
const STORY_NAMES = [
  "With default props",
  "With helper text",
  "With error",
  "With disabled",
  "With ref date constraints",
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
    refDateMax: {
      control: false,
      description:
        "Timestamp of a reference upper-bound datetime. When provided, the resolved value will always be strictly before this datetime.",
      table: {
        type: { summary: "number | null" },
      },
    },
    refDateMin: {
      control: false,
      description:
        "Timestamp of a reference lower-bound datetime. When provided, the resolved value will always be strictly after this datetime.",
      table: {
        type: { summary: "number | null" },
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
  render: args => <RgoInputTimeWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoInputTimeWithDefaultPropsDemoCode,
      },
      description: {
        story: "Time input with default props (HH:MM format).",
      },
    },
  },
};

export const WithHelperText: Story = {
  name: "With helper text",
  args: {
    disabled: false,
    error: false,
    helperText: "Your helpful text goes here",
  },
  render: args => <RgoInputTimeWithHelperTextDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Time input with helpful guidance text displayed.",
      },
      source: {
        code: RgoInputTimeWithHelperTextDemoCode,
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
  render: args => <RgoInputTimeWithErrorDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Time input in error state.",
      },
      source: {
        code: RgoInputTimeWithErrorDemoCode,
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
  render: args => <RgoInputTimeWithDisabledDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Time input in disabled state.",
      },
      source: {
        code: RgoInputTimeWithDisabledDemoCode,
      },
    },
  },
};

export const WithRefDateConstraints: Story = {
  name: "With ref date constraints",
  args: {
    disabled: false,
    error: false,
    helperText: "",
  },
  render: args => <RgoInputTimeWithRefDateConstraintsDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "Time input with refDateMin and refDateMax constraints. The date part of the value is auto-corrected based on the entered time relative to the reference dates.",
      },
      source: {
        code: RgoInputTimeWithRefDateConstraintsDemoCode,
      },
    },
  },
};

export const WithFormInput: Story = {
  name: "With form input",
  argTypes: {
    value: { control: false },
    helperText: { control: false },
    error: { control: false },
    disabled: { control: false },
  },
  render: () => <RgoInputTimeWithFormInputDemo />,
  parameters: {
    docs: {
      description: {
        story: "Time input integration with **react-hook-form** and **zod**.",
      },
      source: {
        code: RgoInputTimeWithFormInputDemoCode,
      },
    },
  },
};
