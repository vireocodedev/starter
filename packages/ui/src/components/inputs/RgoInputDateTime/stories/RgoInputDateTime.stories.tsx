import { RgoInputDateTime } from "@/components/inputs/RgoInputDateTime/RgoInputDateTime";
import {
  RgoInputDateTimeWithCustomizationDemo,
  RgoInputDateTimeWithCustomizationDemoCode,
} from "@/components/inputs/RgoInputDateTime/stories/RgoInputDateTimeWithCustomizationDemo";
import {
  RgoInputDateTimeWithDefaultPropsDemo,
  RgoInputDateTimeWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoInputDateTime/stories/RgoInputDateTimeWithDefaultPropsDemo";
import {
  RgoInputDateTimeWithDisabledDemo,
  RgoInputDateTimeWithDisabledDemoCode,
} from "@/components/inputs/RgoInputDateTime/stories/RgoInputDateTimeWithDisabledDemo";
import {
  RgoInputDateTimeWithErrorDemo,
  RgoInputDateTimeWithErrorDemoCode,
} from "@/components/inputs/RgoInputDateTime/stories/RgoInputDateTimeWithErrorDemo";
import {
  RgoInputDateTimeWithFormInputDemo,
  RgoInputDateTimeWithFormInputDemoCode,
} from "@/components/inputs/RgoInputDateTime/stories/RgoInputDateTimeWithFormInputDemo";
import {
  RgoInputDateTimeWithHelperTextDemo,
  RgoInputDateTimeWithHelperTextDemoCode,
} from "@/components/inputs/RgoInputDateTime/stories/RgoInputDateTimeWithHelperTextDemo";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription, storybookInputComponentArgTypes } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORYBOOK_COMPONENT = RgoInputDateTime;
const STORYBOOK_TITLE = "Components/Inputs/RgoInputDateTime";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const STORYBOOK_USAGE_CODE = RgoInputDateTimeWithDefaultPropsDemoCode;
const INPUT_DESCRIPTION = "Input component for date and time selection.";
const INPUT_VALUE_DESCRIPTION = "The selected date and time as a timestamp (number) or null for no selection";
const INPUT_VALUE_TYPE = "number | null";
const INPUT_SLOT_NAMES = ["datePicker"];
const STORY_NAMES = [
  "With default props",
  "With helper text",
  "With error",
  "With disabled",
  "With customization",
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
  argTypes: storybookInputComponentArgTypes({
    valueDescription: INPUT_VALUE_DESCRIPTION,
    valueType: INPUT_VALUE_TYPE,
    slotNames: INPUT_SLOT_NAMES,
  }),
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
  render: args => <RgoInputDateTimeWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoInputDateTimeWithDefaultPropsDemoCode,
      },
      description: {
        story: "Input with default props",
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
  render: args => <RgoInputDateTimeWithHelperTextDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input with helpful guidance text displayed.",
      },
      source: {
        code: RgoInputDateTimeWithHelperTextDemoCode,
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
  render: args => <RgoInputDateTimeWithErrorDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in error state.",
      },
      source: {
        code: RgoInputDateTimeWithErrorDemoCode,
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
  render: args => <RgoInputDateTimeWithDisabledDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in disabled state.",
      },
      source: {
        code: RgoInputDateTimeWithDisabledDemoCode,
      },
    },
  },
};

export const WithCustomization: Story = {
  name: "With customization",
  args: {
    disabled: false,
    error: false,
    helperText: "Example input using a custom date format",
  },
  render: args => <RgoInputDateTimeWithCustomizationDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input using **rgoSlotProps** to customize internal components.",
      },
      source: {
        code: RgoInputDateTimeWithCustomizationDemoCode,
      },
    },
  },
};

export const WithFormInput: Story = {
  name: "With form input",
  render: () => <RgoInputDateTimeWithFormInputDemo />,
  parameters: {
    docs: {
      description: {
        story: "Input integration with **react-hook-form** and **zod**.",
      },
      source: {
        code: RgoInputDateTimeWithFormInputDemoCode,
      },
    },
  },
};
