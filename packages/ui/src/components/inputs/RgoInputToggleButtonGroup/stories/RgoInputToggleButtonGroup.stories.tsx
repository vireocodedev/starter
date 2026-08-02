import { RgoInputToggleButtonGroup } from "@/components/inputs/RgoInputToggleButtonGroup/RgoInputToggleButtonGroup";
import {
  RgoInputToggleButtonGroupWithDefaultPropsDemo,
  RgoInputToggleButtonGroupWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoInputToggleButtonGroup/stories/RgoInputToggleButtonGroupWithDefaultPropsDemo";
import {
  RgoInputToggleButtonGroupWithDisableClearableDemo,
  RgoInputToggleButtonGroupWithDisableClearableDemoCode,
} from "@/components/inputs/RgoInputToggleButtonGroup/stories/RgoInputToggleButtonGroupWithDisableClearableDemo";
import {
  RgoInputToggleButtonGroupWithDisabledDemo,
  RgoInputToggleButtonGroupWithDisabledDemoCode,
} from "@/components/inputs/RgoInputToggleButtonGroup/stories/RgoInputToggleButtonGroupWithDisabledDemo";
import {
  RgoInputToggleButtonGroupWithErrorDemo,
  RgoInputToggleButtonGroupWithErrorDemoCode,
} from "@/components/inputs/RgoInputToggleButtonGroup/stories/RgoInputToggleButtonGroupWithErrorDemo";
import {
  RgoInputToggleButtonGroupWithFormInputDemo,
  RgoInputToggleButtonGroupWithFormInputDemoCode,
} from "@/components/inputs/RgoInputToggleButtonGroup/stories/RgoInputToggleButtonGroupWithFormInputDemo";
import {
  RgoInputToggleButtonGroupWithHelperTextDemo,
  RgoInputToggleButtonGroupWithHelperTextDemoCode,
} from "@/components/inputs/RgoInputToggleButtonGroup/stories/RgoInputToggleButtonGroupWithHelperTextDemo";
import {
  RgoInputToggleButtonGroupWithMultipleDemo,
  RgoInputToggleButtonGroupWithMultipleDemoCode,
} from "@/components/inputs/RgoInputToggleButtonGroup/stories/RgoInputToggleButtonGroupWithMultipleDemo";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription, storybookInputComponentArgTypes } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORYBOOK_COMPONENT = RgoInputToggleButtonGroup;
const STORYBOOK_TITLE = "Components/Inputs/RgoInputToggleButtonGroup";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const STORYBOOK_USAGE_CODE = RgoInputToggleButtonGroupWithDefaultPropsDemoCode;
const INPUT_DESCRIPTION =
  "A toggle button group input component. Supports single and multiple selection modes with generic typed options. Includes an optional clear button.";
const INPUT_VALUE_DESCRIPTION = "The selected value (TValue | null for single, TValue[] for multiple)";
const INPUT_VALUE_TYPE = "TValue | null | TValue[]";
const INPUT_SLOT_NAMES = ["root", "toggleButtonGroup", "toggleButton", "formHelperText"];
const STORY_NAMES = [
  "With default props",
  "With helper text",
  "With error",
  "With disabled",
  "With multiple",
  "With disable clearable",
  "With form input",
];

const meta: Meta = {
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
    options: {
      control: false,
      description: "The array of options to display as toggle buttons",
      table: {
        type: { summary: "TValue[]" },
      },
    },
    renderOption: {
      control: false,
      description: "Function to render the content of each toggle button",
      table: {
        type: { summary: "(option: TValue) => React.ReactNode" },
      },
    },
    renderKey: {
      control: false,
      description: "Function to generate a unique key for each option",
      table: {
        type: { summary: "(option: TValue) => React.Key" },
      },
    },
    disableClearable: {
      control: "boolean",
      description: "When true, hides the clear button and prevents deselection in single mode",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
      },
    },
    multiple: {
      control: "boolean",
      description: "When true, allows multiple selections. Changes value type to TValue[]",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
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
  render: (args: Record<string, unknown>) => <RgoInputToggleButtonGroupWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoInputToggleButtonGroupWithDefaultPropsDemoCode,
      },
      description: {
        story: "Toggle button group with single selection mode and clearable selection.",
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
  render: (args: Record<string, unknown>) => <RgoInputToggleButtonGroupWithHelperTextDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Toggle button group with a helper text message displayed below the buttons.",
      },
      source: {
        code: RgoInputToggleButtonGroupWithHelperTextDemoCode,
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
  render: (args: Record<string, unknown>) => <RgoInputToggleButtonGroupWithErrorDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Toggle button group in error state with an error message.",
      },
      source: {
        code: RgoInputToggleButtonGroupWithErrorDemoCode,
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
  render: (args: Record<string, unknown>) => <RgoInputToggleButtonGroupWithDisabledDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Toggle button group in disabled state.",
      },
      source: {
        code: RgoInputToggleButtonGroupWithDisabledDemoCode,
      },
    },
  },
};

export const WithMultiple: Story = {
  name: "With multiple",
  args: {
    disabled: false,
    error: false,
    helperText: "",
  },
  render: (args: Record<string, unknown>) => <RgoInputToggleButtonGroupWithMultipleDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Toggle button group with multiple selection mode.",
      },
      source: {
        code: RgoInputToggleButtonGroupWithMultipleDemoCode,
      },
    },
  },
};

export const WithDisableClearable: Story = {
  name: "With disable clearable",
  args: {
    disabled: false,
    error: false,
    helperText: "",
  },
  render: (args: Record<string, unknown>) => <RgoInputToggleButtonGroupWithDisableClearableDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Toggle button group with disableClearable. Once an option is selected, it cannot be deselected.",
      },
      source: {
        code: RgoInputToggleButtonGroupWithDisableClearableDemoCode,
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
  render: (args: Record<string, unknown>) => <RgoInputToggleButtonGroupWithFormInputDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Toggle button group integrated with React Hook Form and Zod validation.",
      },
      source: {
        code: RgoInputToggleButtonGroupWithFormInputDemoCode,
      },
    },
  },
};
