import { RgoInputSwitch } from "@/components/inputs/RgoInputSwitch/RgoInputSwitch";
import {
  RgoInputSwitchWithCustomizationDemo,
  RgoInputSwitchWithCustomizationDemoCode,
} from "@/components/inputs/RgoInputSwitch/stories/RgoInputSwitchWithCustomizationDemo";
import {
  RgoInputSwitchWithDefaultPropsDemo,
  RgoInputSwitchWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoInputSwitch/stories/RgoInputSwitchWithDefaultPropsDemo";
import {
  RgoInputSwitchWithDisabledDemo,
  RgoInputSwitchWithDisabledDemoCode,
} from "@/components/inputs/RgoInputSwitch/stories/RgoInputSwitchWithDisabledDemo";
import {
  RgoInputSwitchWithErrorDemo,
  RgoInputSwitchWithErrorDemoCode,
} from "@/components/inputs/RgoInputSwitch/stories/RgoInputSwitchWithErrorDemo";
import {
  RgoInputSwitchWithFormInputDemo,
  RgoInputSwitchWithFormInputDemoCode,
} from "@/components/inputs/RgoInputSwitch/stories/RgoInputSwitchWithFormInputDemo";
import {
  RgoInputSwitchWithHelperTextDemo,
  RgoInputSwitchWithHelperTextDemoCode,
} from "@/components/inputs/RgoInputSwitch/stories/RgoInputSwitchWithHelperTextDemo";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription, storybookInputComponentArgTypes } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORYBOOK_COMPONENT = RgoInputSwitch;
const STORYBOOK_TITLE = "Components/Inputs/RgoInputSwitch";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const STORYBOOK_USAGE_CODE = RgoInputSwitchWithDefaultPropsDemoCode;
const INPUT_DESCRIPTION = "Input component for boolean toggle with switch control.";
const INPUT_VALUE_DESCRIPTION = "The switch state as boolean";
const INPUT_VALUE_TYPE = "boolean";
const INPUT_SLOT_NAMES = [
  "root",
  "formControlLabel",
  "formControlLabelSwitch",
  "formControlLabelTypography",
  "formHelperText",
];
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
  render: args => <RgoInputSwitchWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoInputSwitchWithDefaultPropsDemoCode,
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
  render: args => <RgoInputSwitchWithHelperTextDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input with helpful guidance text displayed.",
      },
      source: {
        code: RgoInputSwitchWithHelperTextDemoCode,
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
  render: args => <RgoInputSwitchWithErrorDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in error state.",
      },
      source: {
        code: RgoInputSwitchWithErrorDemoCode,
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
  render: args => <RgoInputSwitchWithDisabledDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in disabled state.",
      },
      source: {
        code: RgoInputSwitchWithDisabledDemoCode,
      },
    },
  },
};

export const WithCustomization: Story = {
  name: "With customization",
  args: {
    disabled: false,
    error: false,
    helperText: "Example input with custom switch styling",
  },
  render: args => <RgoInputSwitchWithCustomizationDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input using **rgoSlotProps** to customize internal components.",
      },
      source: {
        code: RgoInputSwitchWithCustomizationDemoCode,
      },
    },
  },
};

export const WithFormInput: Story = {
  name: "With form input",
  render: () => <RgoInputSwitchWithFormInputDemo />,
  parameters: {
    docs: {
      description: {
        story: "Input integration with **react-hook-form** and **zod**.",
      },
      source: {
        code: RgoInputSwitchWithFormInputDemoCode,
      },
    },
  },
};
