import { RgoInputCounter } from "@/components/inputs/RgoInputCounter/RgoInputCounter";
import {
  RgoInputCounterWithCustomRangeDemo,
  RgoInputCounterWithCustomRangeDemoCode,
} from "@/components/inputs/RgoInputCounter/stories/RgoInputCounterWithCustomRangeDemo";
import {
  RgoInputCounterWithDefaultPropsDemo,
  RgoInputCounterWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoInputCounter/stories/RgoInputCounterWithDefaultPropsDemo";
import {
  RgoInputCounterWithDisabledDemo,
  RgoInputCounterWithDisabledDemoCode,
} from "@/components/inputs/RgoInputCounter/stories/RgoInputCounterWithDisabledDemo";
import {
  RgoInputCounterWithErrorDemo,
  RgoInputCounterWithErrorDemoCode,
} from "@/components/inputs/RgoInputCounter/stories/RgoInputCounterWithErrorDemo";
import {
  RgoInputCounterWithFormInputDemo,
  RgoInputCounterWithFormInputDemoCode,
} from "@/components/inputs/RgoInputCounter/stories/RgoInputCounterWithFormInputDemo";
import {
  RgoInputCounterWithHelperTextDemo,
  RgoInputCounterWithHelperTextDemoCode,
} from "@/components/inputs/RgoInputCounter/stories/RgoInputCounterWithHelperTextDemo";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription, storybookInputComponentArgTypes } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORYBOOK_COMPONENT = RgoInputCounter;
const STORYBOOK_TITLE = "Components/Inputs/RgoInputCounter";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const STORYBOOK_USAGE_CODE = RgoInputCounterWithDefaultPropsDemoCode;
const INPUT_DESCRIPTION =
  "A numeric input with increment and decrement buttons. Wraps RgoInputNumber with +/- button adornments.";
const INPUT_VALUE_DESCRIPTION = "The numeric value as a number or null";
const INPUT_VALUE_TYPE = "number | null";
const INPUT_SLOT_NAMES = ["root"];
const STORY_NAMES = [
  "With default props",
  "With helper text",
  "With error",
  "With disabled",
  "With custom range",
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
    min: {
      control: "number",
      description: "Minimum value",
      table: {
        defaultValue: { summary: "1" },
        type: { summary: "number" },
      },
    },
    max: {
      control: "number",
      description: "Maximum value",
      table: {
        defaultValue: { summary: "99" },
        type: { summary: "number" },
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
  render: args => <RgoInputCounterWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoInputCounterWithDefaultPropsDemoCode,
      },
      description: {
        story: "Counter input with default props.",
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
  render: args => <RgoInputCounterWithHelperTextDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Counter input with a helper text message displayed below the field.",
      },
      source: {
        code: RgoInputCounterWithHelperTextDemoCode,
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
  render: args => <RgoInputCounterWithErrorDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Counter input in error state with an error message.",
      },
      source: {
        code: RgoInputCounterWithErrorDemoCode,
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
  render: args => <RgoInputCounterWithDisabledDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Counter input in disabled state. The +/- buttons are hidden when disabled.",
      },
      source: {
        code: RgoInputCounterWithDisabledDemoCode,
      },
    },
  },
};

export const WithCustomRange: Story = {
  name: "With custom range",
  args: {
    disabled: false,
    error: false,
    helperText: "",
  },
  render: args => <RgoInputCounterWithCustomRangeDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Counter input with a custom min/max range (1-10).",
      },
      source: {
        code: RgoInputCounterWithCustomRangeDemoCode,
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
  render: args => <RgoInputCounterWithFormInputDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Counter input integrated with React Hook Form and Zod validation.",
      },
      source: {
        code: RgoInputCounterWithFormInputDemoCode,
      },
    },
  },
};
