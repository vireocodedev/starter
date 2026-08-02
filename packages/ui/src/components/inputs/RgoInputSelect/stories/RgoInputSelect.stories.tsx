import { RgoInputSelect } from "@/components/inputs/RgoInputSelect/RgoInputSelect";
import {
  RgoInputSelectWithCustomizationDemo,
  RgoInputSelectWithCustomizationDemoCode,
} from "@/components/inputs/RgoInputSelect/stories/RgoInputSelectWithCustomizationDemo";
import {
  RgoInputSelectWithDefaultPropsDemo,
  RgoInputSelectWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoInputSelect/stories/RgoInputSelectWithDefaultPropsDemo";
import {
  RgoInputSelectWithDisabledDemo,
  RgoInputSelectWithDisabledDemoCode,
} from "@/components/inputs/RgoInputSelect/stories/RgoInputSelectWithDisabledDemo";
import {
  RgoInputSelectWithDropdownCustomizationDemo,
  RgoInputSelectWithDropdownCustomizationDemoCode,
} from "@/components/inputs/RgoInputSelect/stories/RgoInputSelectWithDropdownCustomizationDemo";
import {
  RgoInputSelectWithErrorDemo,
  RgoInputSelectWithErrorDemoCode,
} from "@/components/inputs/RgoInputSelect/stories/RgoInputSelectWithErrorDemo";
import {
  RgoInputSelectWithFormInputDemo,
  RgoInputSelectWithFormInputDemoCode,
} from "@/components/inputs/RgoInputSelect/stories/RgoInputSelectWithFormInputDemo";
import {
  RgoInputSelectWithHelperTextDemo,
  RgoInputSelectWithHelperTextDemoCode,
} from "@/components/inputs/RgoInputSelect/stories/RgoInputSelectWithHelperTextDemo";
import {
  RgoInputSelectWithNoClearDemo,
  RgoInputSelectWithNoClearDemoCode,
} from "@/components/inputs/RgoInputSelect/stories/RgoInputSelectWithNoClearDemo";
import {
  RgoInputSelectWithPlaceholderDemo,
  RgoInputSelectWithPlaceholderDemoCode,
} from "@/components/inputs/RgoInputSelect/stories/RgoInputSelectWithPlaceholderDemo";
import {
  RgoInputSelectWithRenderOptionDemo,
  RgoInputSelectWithRenderOptionDemoCode,
} from "@/components/inputs/RgoInputSelect/stories/RgoInputSelectWithRenderOptionDemo";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription, storybookInputComponentArgTypes } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORYBOOK_COMPONENT = RgoInputSelect;
const STORYBOOK_TITLE = "Components/Inputs/RgoInputSelect";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const STORYBOOK_USAGE_CODE = RgoInputSelectWithDefaultPropsDemoCode;
const INPUT_DESCRIPTION = "Input component for selecting from a list of options.";
const INPUT_VALUE_DESCRIPTION = "The selected option value or null for no selection";
const INPUT_VALUE_TYPE = "V | null";
const INPUT_SLOT_NAMES = ["root", "inputLabel", "select", "selectItem", "selectItemText", "formHelperText"];
const STORYBOOK_GENERICS = [
  { name: "T", description: "Type of the option objects in the `options` array." },
  { name: "V", description: "Type of the value representing the selected option, must be `string` or `number`." },
];
const STORY_NAMES = [
  "With default props",
  "With helper text",
  "With error",
  "With disabled",
  "With customization",
  "With render option",
  "With no clear",
  "With placeholder",
  "With dropdown customization",
  "With form input",
];

// Define the story args type based on the demo component props
type StoryArgs = {
  disabled: boolean;
  error: boolean;
  helperText: string;
  placeholder: string;
  disableClearable?: boolean;
  optionHeight?: number;
  optionPadding?: number;
  dropdownMaxItemsVisible?: number;
};

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
          generics: STORYBOOK_GENERICS,
        }),
      },
    },
  },
  argTypes: {
    ...storybookInputComponentArgTypes({
      valueType: INPUT_VALUE_TYPE,
      valueDescription: INPUT_VALUE_DESCRIPTION,
      slotNames: INPUT_SLOT_NAMES,
    }),
    placeholder: {
      description: "Placeholder text when no option is selected",
      control: "text",
    },
    disableClearable: {
      description: "If true, the clear action will be disabled",
      control: "boolean",
    },
    options: {
      description: "Array of options to display in the select dropdown",
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
  render: (args: StoryArgs) => <RgoInputSelectWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoInputSelectWithDefaultPropsDemoCode,
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
  render: (args: StoryArgs) => <RgoInputSelectWithHelperTextDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input with helpful guidance text displayed.",
      },
      source: {
        code: RgoInputSelectWithHelperTextDemoCode,
      },
    },
  },
};

export const WithError: Story = {
  name: "With error",
  args: {
    disabled: false,
    error: true,
    helperText: "Oops, there seems to be an error",
  },
  render: (args: StoryArgs) => <RgoInputSelectWithErrorDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in error state.",
      },
      source: {
        code: RgoInputSelectWithErrorDemoCode,
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
  render: (args: StoryArgs) => <RgoInputSelectWithDisabledDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in disabled state.",
      },
      source: {
        code: RgoInputSelectWithDisabledDemoCode,
      },
    },
  },
};

export const WithCustomization: Story = {
  name: "With customization",
  args: {
    disabled: false,
    error: false,
    helperText: "Example input with custom styling",
  },
  render: (args: StoryArgs) => <RgoInputSelectWithCustomizationDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input using **rgoSlotProps** to customize internal components.",
      },
      source: {
        code: RgoInputSelectWithCustomizationDemoCode,
      },
    },
  },
};

export const WithFormInput: Story = {
  name: "With form input",
  render: () => <RgoInputSelectWithFormInputDemo />,
  parameters: {
    docs: {
      description: {
        story: "Input integration with **react-hook-form** and **zod**.",
      },
      source: {
        code: RgoInputSelectWithFormInputDemoCode,
      },
    },
  },
};

export const WithRenderOption: Story = {
  name: "With render option",
  args: {
    disabled: false,
    error: false,
    helperText: "Custom rendering for each option",
  },
  render: (args: StoryArgs) => <RgoInputSelectWithRenderOptionDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input with custom **renderOption** to display enhanced option content.",
      },
      source: {
        code: RgoInputSelectWithRenderOptionDemoCode,
      },
    },
  },
};

export const WithNoClear: Story = {
  name: "With no clear",
  args: {
    disabled: false,
    error: false,
    helperText: "Clear action is disabled",
    disableClearable: true,
  },
  render: (args: StoryArgs) => <RgoInputSelectWithNoClearDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input with **disableClearable** set to true, preventing users from clearing the selection.",
      },
      source: {
        code: RgoInputSelectWithNoClearDemoCode,
      },
    },
  },
};

export const WithPlaceholder: Story = {
  name: "With placeholder",
  args: {
    disabled: false,
    error: false,
    helperText: "Custom placeholder text",
    placeholder: "Choose your favorite color...",
  },
  render: (args: StoryArgs) => <RgoInputSelectWithPlaceholderDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input with custom **placeholder** text to guide user selection.",
      },
      source: {
        code: RgoInputSelectWithPlaceholderDemoCode,
      },
    },
  },
};

export const WithDropdownCustomization: Story = {
  name: "With dropdown customization",
  args: {
    disabled: false,
    error: false,
    helperText: "Customized dropdown dimensions",
    optionHeight: 60,
    optionPadding: 12,
    dropdownMaxItemsVisible: 4,
  },
  render: (args: StoryArgs) => <RgoInputSelectWithDropdownCustomizationDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "Input with customized **optionHeight**, **optionPadding**, and **dropdownMaxItemsVisible** for enhanced dropdown appearance.",
      },
      source: {
        code: RgoInputSelectWithDropdownCustomizationDemoCode,
      },
    },
  },
};
