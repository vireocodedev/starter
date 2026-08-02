import { RgoInputPassword } from "@/components/inputs/RgoInputPassword/RgoInputPassword";
import {
  RgoInputPasswordWithCustomizationDemo,
  RgoInputPasswordWithCustomizationDemoCode,
} from "@/components/inputs/RgoInputPassword/stories/RgoInputPasswordWithCustomizationDemo";
import {
  RgoInputPasswordWithDefaultPropsDemo,
  RgoInputPasswordWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoInputPassword/stories/RgoInputPasswordWithDefaultPropsDemo";
import {
  RgoInputPasswordWithDisabledDemo,
  RgoInputPasswordWithDisabledDemoCode,
} from "@/components/inputs/RgoInputPassword/stories/RgoInputPasswordWithDisabledDemo";
import {
  RgoInputPasswordWithErrorDemo,
  RgoInputPasswordWithErrorDemoCode,
} from "@/components/inputs/RgoInputPassword/stories/RgoInputPasswordWithErrorDemo";
import {
  RgoInputPasswordWithFormInputDemo,
  RgoInputPasswordWithFormInputDemoCode,
} from "@/components/inputs/RgoInputPassword/stories/RgoInputPasswordWithFormInputDemo";
import {
  RgoInputPasswordWithHelperTextDemo,
  RgoInputPasswordWithHelperTextDemoCode,
} from "@/components/inputs/RgoInputPassword/stories/RgoInputPasswordWithHelperTextDemo";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription, storybookInputComponentArgTypes } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORYBOOK_COMPONENT = RgoInputPassword;
const STORYBOOK_TITLE = "Components/Inputs/RgoInputPassword";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const STORYBOOK_USAGE_CODE = RgoInputPasswordWithDefaultPropsDemoCode;
const INPUT_DESCRIPTION = "Input component for password entry with visibility toggle.";
const INPUT_VALUE_DESCRIPTION = "The password string value or null for no input";
const INPUT_VALUE_TYPE = "string | null";
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
  render: args => <RgoInputPasswordWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoInputPasswordWithDefaultPropsDemoCode,
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
  render: args => <RgoInputPasswordWithHelperTextDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input with helpful guidance text displayed.",
      },
      source: {
        code: RgoInputPasswordWithHelperTextDemoCode,
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
  render: args => <RgoInputPasswordWithErrorDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in error state.",
      },
      source: {
        code: RgoInputPasswordWithErrorDemoCode,
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
  render: args => <RgoInputPasswordWithDisabledDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in disabled state.",
      },
      source: {
        code: RgoInputPasswordWithDisabledDemoCode,
      },
    },
  },
};

export const WithCustomization: Story = {
  name: "With customization",
  args: {
    disabled: false,
    error: false,
    helperText: "Example input with custom visibility icons",
  },
  render: args => <RgoInputPasswordWithCustomizationDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input using **rgoSlotProps** to customize internal components.",
      },
      source: {
        code: RgoInputPasswordWithCustomizationDemoCode,
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
  render: () => <RgoInputPasswordWithFormInputDemo />,
  parameters: {
    docs: {
      description: {
        story: "Input integration with **react-hook-form** and **zod**.",
      },
      source: {
        code: RgoInputPasswordWithFormInputDemoCode,
      },
    },
  },
};
