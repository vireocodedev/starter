import { RgoInputDate } from "@/components/inputs/RgoInputDate/RgoInputDate";
import {
  RgoInputDateWithCustomizationDemo,
  RgoInputDateWithCustomizationDemoCode,
} from "@/components/inputs/RgoInputDate/stories/RgoInputDateWithCustomizationDemo";
import {
  RgoInputDateWithDefaultPropsDemo,
  RgoInputDateWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoInputDate/stories/RgoInputDateWithDefaultPropsDemo";
import {
  RgoInputDateWithDisabledDemo,
  RgoInputDateWithDisabledDemoCode,
} from "@/components/inputs/RgoInputDate/stories/RgoInputDateWithDisabledDemo";
import {
  RgoInputDateWithErrorDemo,
  RgoInputDateWithErrorDemoCode,
} from "@/components/inputs/RgoInputDate/stories/RgoInputDateWithErrorDemo";
import {
  RgoInputDateWithFormInputDemo,
  RgoInputDateWithFormInputDemoCode,
} from "@/components/inputs/RgoInputDate/stories/RgoInputDateWithFormInputDemo";
import {
  RgoInputDateWithHelperTextDemo,
  RgoInputDateWithHelperTextDemoCode,
} from "@/components/inputs/RgoInputDate/stories/RgoInputDateWithHelperTextDemo";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription, storybookInputComponentArgTypes } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORYBOOK_COMPONENT = RgoInputDate;
const STORYBOOK_TITLE = "Components/Inputs/RgoInputDate";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const STORYBOOK_USAGE_CODE = RgoInputDateWithDefaultPropsDemoCode;
const INPUT_DESCRIPTION = "Input component for date selection.";
const INPUT_VALUE_DESCRIPTION = "The selected date as a timestamp (number) or null for no selection";
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
  render: args => <RgoInputDateWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoInputDateWithDefaultPropsDemoCode,
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
  render: args => <RgoInputDateWithHelperTextDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input with helpful guidance text displayed.",
      },
      source: {
        code: RgoInputDateWithHelperTextDemoCode,
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
  render: args => <RgoInputDateWithErrorDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in error state.",
      },
      source: {
        code: RgoInputDateWithErrorDemoCode,
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
  render: args => <RgoInputDateWithDisabledDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in disabled state.",
      },
      source: {
        code: RgoInputDateWithDisabledDemoCode,
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
  render: args => <RgoInputDateWithCustomizationDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input using **rgoSlotProps** to customize internal components.",
      },
      source: {
        code: RgoInputDateWithCustomizationDemoCode,
      },
    },
  },
};

export const WithFormInput: Story = {
  name: "With form input",
  render: () => <RgoInputDateWithFormInputDemo />,
  parameters: {
    docs: {
      description: {
        story: "Input integration with **react-hook-form** and **zod**.",
      },
      source: {
        code: RgoInputDateWithFormInputDemoCode,
      },
    },
  },
};
