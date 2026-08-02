import { RgoInputNumber } from "@/components/inputs/RgoInputNumber/RgoInputNumber";
import {
  RgoInputNumberWithCustomizationDemo,
  RgoInputNumberWithCustomizationDemoCode,
} from "@/components/inputs/RgoInputNumber/stories/RgoInputNumberWithCustomizationDemo";
import {
  RgoInputNumberWithDefaultPropsDemo,
  RgoInputNumberWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoInputNumber/stories/RgoInputNumberWithDefaultPropsDemo";
import {
  RgoInputNumberWithDisabledDemo,
  RgoInputNumberWithDisabledDemoCode,
} from "@/components/inputs/RgoInputNumber/stories/RgoInputNumberWithDisabledDemo";
import {
  RgoInputNumberWithErrorDemo,
  RgoInputNumberWithErrorDemoCode,
} from "@/components/inputs/RgoInputNumber/stories/RgoInputNumberWithErrorDemo";
import {
  RgoInputNumberWithFormInputDemo,
  RgoInputNumberWithFormInputDemoCode,
} from "@/components/inputs/RgoInputNumber/stories/RgoInputNumberWithFormInputDemo";
import {
  RgoInputNumberWithHelperTextDemo,
  RgoInputNumberWithHelperTextDemoCode,
} from "@/components/inputs/RgoInputNumber/stories/RgoInputNumberWithHelperTextDemo";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription, storybookInputComponentArgTypes } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORYBOOK_COMPONENT = RgoInputNumber;
const STORYBOOK_TITLE = "Components/Inputs/RgoInputNumber";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const STORYBOOK_USAGE_CODE = RgoInputNumberWithDefaultPropsDemoCode;
const INPUT_DESCRIPTION = "Input component for entering and formatting numeric values.";
const INPUT_VALUE_DESCRIPTION = "Current value of the input.";
const INPUT_VALUE_TYPE = "number | null";
const INPUT_SLOT_NAMES = ["root"];
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
  argTypes: {
    ...storybookInputComponentArgTypes({
      valueDescription: INPUT_VALUE_DESCRIPTION,
      valueType: INPUT_VALUE_TYPE,
      slotNames: INPUT_SLOT_NAMES,
    }),
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
  render: args => <RgoInputNumberWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoInputNumberWithDefaultPropsDemoCode,
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
  render: args => <RgoInputNumberWithHelperTextDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input with helpful guidance text displayed.",
      },
      source: {
        code: RgoInputNumberWithHelperTextDemoCode,
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
  render: args => <RgoInputNumberWithErrorDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in error state.",
      },
      source: {
        code: RgoInputNumberWithErrorDemoCode,
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
  render: args => <RgoInputNumberWithDisabledDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in disabled state.",
      },
      source: {
        code: RgoInputNumberWithDisabledDemoCode,
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
  render: args => <RgoInputNumberWithCustomizationDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input using **rgoSlotProps** to customize internal components.",
      },
      source: {
        code: RgoInputNumberWithCustomizationDemoCode,
      },
    },
  },
};

export const WithFormInput: Story = {
  name: "With form input",
  argTypes: {
    value: {
      control: false,
    },
    helperText: {
      control: false,
    },
    error: {
      control: false,
    },
    disabled: {
      control: false,
    },
  },
  render: () => <RgoInputNumberWithFormInputDemo />,
  parameters: {
    docs: {
      description: {
        story: "Input integration with **react-hook-form** and **zod**.",
      },
      source: {
        code: RgoInputNumberWithFormInputDemoCode,
      },
    },
  },
};
