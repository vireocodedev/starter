import { RgoInputSelectMultiple } from "@/components/inputs/RgoInputSelectMultiple/RgoInputSelectMultiple";
import {
  RgoInputSelectMultipleWithCustomizationDemo,
  RgoInputSelectMultipleWithCustomizationDemoCode,
} from "@/components/inputs/RgoInputSelectMultiple/stories/RgoInputSelectMultipleWithCustomizationDemo";
import {
  RgoInputSelectMultipleWithDefaultPropsDemo,
  RgoInputSelectMultipleWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoInputSelectMultiple/stories/RgoInputSelectMultipleWithDefaultPropsDemo";
import {
  RgoInputSelectMultipleWithDisabledDemo,
  RgoInputSelectMultipleWithDisabledDemoCode,
} from "@/components/inputs/RgoInputSelectMultiple/stories/RgoInputSelectMultipleWithDisabledDemo";
import {
  RgoInputSelectMultipleWithErrorDemo,
  RgoInputSelectMultipleWithErrorDemoCode,
} from "@/components/inputs/RgoInputSelectMultiple/stories/RgoInputSelectMultipleWithErrorDemo";
import {
  RgoInputSelectMultipleWithFormInputDemo,
  RgoInputSelectMultipleWithFormInputDemoCode,
} from "@/components/inputs/RgoInputSelectMultiple/stories/RgoInputSelectMultipleWithFormInputDemo";
import {
  RgoInputSelectMultipleWithHelperTextDemo,
  RgoInputSelectMultipleWithHelperTextDemoCode,
} from "@/components/inputs/RgoInputSelectMultiple/stories/RgoInputSelectMultipleWithHelperTextDemo";
import {
  RgoInputSelectMultipleWithPlaceholderDemo,
  RgoInputSelectMultipleWithPlaceholderDemoCode,
} from "@/components/inputs/RgoInputSelectMultiple/stories/RgoInputSelectMultipleWithPlaceholderDemo";
import {
  RgoInputSelectMultipleWithRenderOptionDemo,
  RgoInputSelectMultipleWithRenderOptionDemoCode,
} from "@/components/inputs/RgoInputSelectMultiple/stories/RgoInputSelectMultipleWithRenderOptionDemo";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription, storybookInputComponentArgTypes } from "@/utils/storybookutils";
import type { StoryObj } from "@storybook/react-vite";

const STORYBOOK_COMPONENT = RgoInputSelectMultiple;
const STORYBOOK_TITLE = "Components/Inputs/RgoInputSelectMultiple";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const STORYBOOK_USAGE_CODE = RgoInputSelectMultipleWithDefaultPropsDemoCode;
const INPUT_DESCRIPTION = "Input component for selecting multiple options from a list.";
const INPUT_VALUE_DESCRIPTION = "The selected option values as an array";
const INPUT_VALUE_TYPE = "V[]";
const INPUT_SLOT_NAMES = ["root", "inputLabel", "select", "selectItem", "selectItemText", "formHelperText"];
const STORYBOOK_GENERICS = [
  { name: "T", description: "Type of the option objects in the `options` array." },
  { name: "V", description: "Type of the value representing the selected options, must be `string` or `number`." },
];

// Define the story args type based on the demo component props
type StoryArgs = {
  disabled: boolean;
  error: boolean;
  helperText: string;
};

const STORY_NAMES = [
  "With default props",
  "With helper text",
  "With error",
  "With disabled",
  "With customization",
  "With render option",
  "With placeholder",
  "With form input",
];

const meta = {
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
          generics: STORYBOOK_GENERICS,
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
    placeholder: {
      description: "Placeholder text when no options are selected",
      control: "text",
    },
    options: {
      description: "Array of option objects to choose from",
      control: false,
      table: {
        type: { summary: "T[]" },
      },
    },
    renderOption: {
      description: "Function to render each option in the dropdown list",
      control: false,
      table: {
        type: { summary: "(option: T) => React.ReactNode" },
      },
    },
    renderValue: {
      description: "Function to extract the value from an option object",
      control: false,
      table: {
        type: { summary: "(option: T) => V" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<StoryArgs>;

export const WithDefaultProps: Story = {
  name: "With default props",
  args: {
    disabled: false,
    error: false,
    helperText: "",
  },
  render: args => <RgoInputSelectMultipleWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoInputSelectMultipleWithDefaultPropsDemoCode,
      },
      description: {
        story: "Multiple select with default props",
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
  render: args => <RgoInputSelectMultipleWithHelperTextDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Multiple select with helpful guidance text displayed.",
      },
      source: {
        code: RgoInputSelectMultipleWithHelperTextDemoCode,
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
  render: args => <RgoInputSelectMultipleWithErrorDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Multiple select in error state.",
      },
      source: {
        code: RgoInputSelectMultipleWithErrorDemoCode,
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
  render: args => <RgoInputSelectMultipleWithDisabledDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Multiple select in disabled state.",
      },
      source: {
        code: RgoInputSelectMultipleWithDisabledDemoCode,
      },
    },
  },
};

export const WithCustomization: Story = {
  name: "With customization",
  args: {
    disabled: false,
    error: false,
    helperText: "Example customized select component",
  },
  render: args => <RgoInputSelectMultipleWithCustomizationDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Multiple select using **rgoSlotProps** to customize internal components.",
      },
      source: {
        code: RgoInputSelectMultipleWithCustomizationDemoCode,
      },
    },
  },
};

export const WithRenderOption: Story = {
  name: "With render option",
  args: {
    disabled: false,
    error: false,
    helperText: "",
  },
  render: args => <RgoInputSelectMultipleWithRenderOptionDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Multiple select with custom option rendering.",
      },
      source: {
        code: RgoInputSelectMultipleWithRenderOptionDemoCode,
      },
    },
  },
};

export const WithPlaceholder: Story = {
  name: "With placeholder",
  args: {
    disabled: false,
    error: false,
    helperText: "",
  },
  render: args => <RgoInputSelectMultipleWithPlaceholderDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Multiple select with custom placeholder text.",
      },
      source: {
        code: RgoInputSelectMultipleWithPlaceholderDemoCode,
      },
    },
  },
};

export const WithFormInput: Story = {
  name: "With form input",
  argTypes: {
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
  render: () => <RgoInputSelectMultipleWithFormInputDemo />,
  parameters: {
    docs: {
      description: {
        story: "Multiple select integration with **react-hook-form** and **zod**.",
      },
      source: {
        code: RgoInputSelectMultipleWithFormInputDemoCode,
      },
    },
  },
};
