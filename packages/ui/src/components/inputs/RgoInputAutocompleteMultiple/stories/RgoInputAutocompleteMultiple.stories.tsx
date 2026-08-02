import { RgoInputAutocompleteMultiple } from "@/components/inputs/RgoInputAutocompleteMultiple/RgoInputAutocompleteMultiple";
import {
  RgoInputAutocompleteMultipleWithAsyncDemo,
  RgoInputAutocompleteMultipleWithAsyncDemoCode,
} from "@/components/inputs/RgoInputAutocompleteMultiple/stories/RgoInputAutocompleteMultipleWithAsyncDemo";
import {
  RgoInputAutocompleteMultipleWithCustomizationDemo,
  RgoInputAutocompleteMultipleWithCustomizationDemoCode,
} from "@/components/inputs/RgoInputAutocompleteMultiple/stories/RgoInputAutocompleteMultipleWithCustomizationDemo";
import {
  RgoInputAutocompleteMultipleWithDefaultPropsDemo,
  RgoInputAutocompleteMultipleWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoInputAutocompleteMultiple/stories/RgoInputAutocompleteMultipleWithDefaultPropsDemo";
import {
  RgoInputAutocompleteMultipleWithDisabledDemo,
  RgoInputAutocompleteMultipleWithDisabledDemoCode,
} from "@/components/inputs/RgoInputAutocompleteMultiple/stories/RgoInputAutocompleteMultipleWithDisabledDemo";
import {
  RgoInputAutocompleteMultipleWithErrorDemo,
  RgoInputAutocompleteMultipleWithErrorDemoCode,
} from "@/components/inputs/RgoInputAutocompleteMultiple/stories/RgoInputAutocompleteMultipleWithErrorDemo";
import {
  RgoInputAutocompleteMultipleWithFormInputDemo,
  RgoInputAutocompleteMultipleWithFormInputDemoCode,
} from "@/components/inputs/RgoInputAutocompleteMultiple/stories/RgoInputAutocompleteMultipleWithFormInputDemo";
import {
  RgoInputAutocompleteMultipleWithHelperTextDemo,
  RgoInputAutocompleteMultipleWithHelperTextDemoCode,
} from "@/components/inputs/RgoInputAutocompleteMultiple/stories/RgoInputAutocompleteMultipleWithHelperTextDemo";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription, storybookInputComponentArgTypes } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORYBOOK_COMPONENT = RgoInputAutocompleteMultiple;
const STORYBOOK_TITLE = "Components/Inputs/RgoInputAutocompleteMultiple";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const STORYBOOK_USAGE_CODE = RgoInputAutocompleteMultipleWithDefaultPropsDemoCode;
const INPUT_DESCRIPTION =
  "Input component for multiple autocomplete functionality with both synchronous and asynchronous option loading.";
const INPUT_VALUE_DESCRIPTION = "The array of selected option objects";
const INPUT_VALUE_TYPE = "T[]";
const INPUT_SLOT_NAMES = ["root", "textField"];
const STORYBOOK_GENERICS = [
  { name: "T", description: "Type of the option objects that can be selected from the autocomplete." },
];
const STORY_NAMES = [
  "With default props",
  "With helper text",
  "With error",
  "With disabled",
  "With customization",
  "With async search",
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
    searchText: {
      description: "Current search text in the input field",
      control: false,
    },
    onSearchTextChange: {
      description: "Callback fired when the search text changes",
      control: false,
    },
    options: {
      description: "Array of options to display OR async function to fetch options",
      control: false,
      table: {
        type: { summary: "T[] | ((searchText: string) => Promise<T[]>)" },
      },
    },
    standaloneOptions: {
      description: "Static options to always show (useful for async options)",
      control: false,
      table: {
        type: { summary: "T[]" },
      },
    },
    getOptionLabel: {
      description: "Function to get the display label for an option",
      control: false,
      table: {
        type: { summary: "(option: T) => string" },
      },
    },
    isOptionEqualToValue: {
      description: "Function to determine if two options are equal",
      control: false,
      table: {
        type: { summary: "(option: T, value: T) => boolean" },
      },
    },
    getOptionDisabled: {
      description: "Function to disable specific options",
      control: false,
      table: {
        type: { summary: "(option: T) => boolean" },
      },
    },
    renderOption: {
      description: "Custom render function for options",
      control: false,
      table: {
        type: { summary: "(props: React.HTMLAttributes<HTMLLIElement>, option: T) => React.ReactNode" },
      },
    },
    searchMinLength: {
      description: "Minimum length of search text to trigger async search",
      control: "number",
      defaultValue: 3,
    },
    debounceDelay: {
      description: "Debounce delay for async search in milliseconds",
      control: "number",
      defaultValue: 300,
    },
    startAdornment: {
      description: "Start adornment for the input",
      control: false,
    },
    endAdornment: {
      description: "End adornment for the input",
      control: false,
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
    searchMinLength: 3,
    debounceDelay: 300,
  },
  render: (args: Record<string, unknown>) => <RgoInputAutocompleteMultipleWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoInputAutocompleteMultipleWithDefaultPropsDemoCode,
      },
      description: {
        story: "Input with default props for multiple selection",
      },
    },
  },
};

export const WithHelperText: Story = {
  name: "With helper text",
  args: {
    disabled: false,
    error: false,
    helperText: "Select multiple items from the list",
    searchMinLength: 3,
    debounceDelay: 300,
  },
  render: (args: Record<string, unknown>) => <RgoInputAutocompleteMultipleWithHelperTextDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input with helpful guidance text displayed.",
      },
      source: {
        code: RgoInputAutocompleteMultipleWithHelperTextDemoCode,
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
    searchMinLength: 3,
    debounceDelay: 300,
  },
  render: (args: Record<string, unknown>) => <RgoInputAutocompleteMultipleWithErrorDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in error state.",
      },
      source: {
        code: RgoInputAutocompleteMultipleWithErrorDemoCode,
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
    searchMinLength: 3,
    debounceDelay: 300,
  },
  render: (args: Record<string, unknown>) => <RgoInputAutocompleteMultipleWithDisabledDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in disabled state with pre-selected items.",
      },
      source: {
        code: RgoInputAutocompleteMultipleWithDisabledDemoCode,
      },
    },
  },
};

export const WithCustomization: Story = {
  name: "With customization",
  args: {
    disabled: false,
    error: false,
    helperText: "Example input with custom option and tag rendering",
    searchMinLength: 3,
    debounceDelay: 300,
  },
  render: (args: Record<string, unknown>) => <RgoInputAutocompleteMultipleWithCustomizationDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input using **renderOption**, **renderTags**, and **rgoSlotProps** to customize appearance.",
      },
      source: {
        code: RgoInputAutocompleteMultipleWithCustomizationDemoCode,
      },
    },
  },
};

export const WithAsyncSearch: Story = {
  name: "With async search",
  args: {
    disabled: false,
    error: false,
    helperText: "Start typing to search users (min 2 characters)",
    searchMinLength: 3,
    debounceDelay: 300,
  },
  render: (args: Record<string, unknown>) => <RgoInputAutocompleteMultipleWithAsyncDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input with **async options function** for server-side search with debouncing and loading states.",
      },
      source: {
        code: RgoInputAutocompleteMultipleWithAsyncDemoCode,
      },
    },
  },
};

export const WithFormInput: Story = {
  name: "With form input",
  render: () => <RgoInputAutocompleteMultipleWithFormInputDemo />,
  parameters: {
    docs: {
      description: {
        story: "Input integration with **react-hook-form** and **zod** for multiple selections.",
      },
      source: {
        code: RgoInputAutocompleteMultipleWithFormInputDemoCode,
      },
    },
  },
};
