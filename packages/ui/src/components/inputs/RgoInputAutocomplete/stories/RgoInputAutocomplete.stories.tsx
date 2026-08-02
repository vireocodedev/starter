import { RgoInputAutocomplete } from "@/components/inputs/RgoInputAutocomplete/RgoInputAutocomplete";
import {
  RgoInputAutocompleteWithAsyncDemo,
  RgoInputAutocompleteWithAsyncDemoCode,
} from "@/components/inputs/RgoInputAutocomplete/stories/RgoInputAutocompleteWithAsyncDemo";
import {
  RgoInputAutocompleteWithCustomizationDemo,
  RgoInputAutocompleteWithCustomizationDemoCode,
} from "@/components/inputs/RgoInputAutocomplete/stories/RgoInputAutocompleteWithCustomizationDemo";
import {
  RgoInputAutocompleteWithDefaultPropsDemo,
  RgoInputAutocompleteWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoInputAutocomplete/stories/RgoInputAutocompleteWithDefaultPropsDemo";
import {
  RgoInputAutocompleteWithDisabledDemo,
  RgoInputAutocompleteWithDisabledDemoCode,
} from "@/components/inputs/RgoInputAutocomplete/stories/RgoInputAutocompleteWithDisabledDemo";
import {
  RgoInputAutocompleteWithErrorDemo,
  RgoInputAutocompleteWithErrorDemoCode,
} from "@/components/inputs/RgoInputAutocomplete/stories/RgoInputAutocompleteWithErrorDemo";
import {
  RgoInputAutocompleteWithFormInputDemo,
  RgoInputAutocompleteWithFormInputDemoCode,
} from "@/components/inputs/RgoInputAutocomplete/stories/RgoInputAutocompleteWithFormInputDemo";
import {
  RgoInputAutocompleteWithHelperTextDemo,
  RgoInputAutocompleteWithHelperTextDemoCode,
} from "@/components/inputs/RgoInputAutocomplete/stories/RgoInputAutocompleteWithHelperTextDemo";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription, storybookInputComponentArgTypes } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORYBOOK_COMPONENT = RgoInputAutocomplete;
const STORYBOOK_TITLE = "Components/Inputs/RgoInputAutocomplete";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const STORYBOOK_USAGE_CODE = RgoInputAutocompleteWithDefaultPropsDemoCode;
const INPUT_DESCRIPTION =
  "Input component for autocomplete functionality with both synchronous and asynchronous option loading.";
const INPUT_VALUE_DESCRIPTION = "The selected option object or null for no selection";
const INPUT_VALUE_TYPE = "T | null";
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
  render: (args: Record<string, unknown>) => <RgoInputAutocompleteWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoInputAutocompleteWithDefaultPropsDemoCode,
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
    searchMinLength: 3,
    debounceDelay: 300,
  },
  render: (args: Record<string, unknown>) => <RgoInputAutocompleteWithHelperTextDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input with helpful guidance text displayed.",
      },
      source: {
        code: RgoInputAutocompleteWithHelperTextDemoCode,
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
  render: (args: Record<string, unknown>) => <RgoInputAutocompleteWithErrorDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in error state.",
      },
      source: {
        code: RgoInputAutocompleteWithErrorDemoCode,
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
  render: (args: Record<string, unknown>) => <RgoInputAutocompleteWithDisabledDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in disabled state.",
      },
      source: {
        code: RgoInputAutocompleteWithDisabledDemoCode,
      },
    },
  },
};

export const WithCustomization: Story = {
  name: "With customization",
  args: {
    disabled: false,
    error: false,
    helperText: "Example input with custom option rendering and styling",
    searchMinLength: 3,
    debounceDelay: 300,
  },
  render: (args: Record<string, unknown>) => <RgoInputAutocompleteWithCustomizationDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input using **renderOption**, **startAdornment**, and **rgoSlotProps** to customize appearance.",
      },
      source: {
        code: RgoInputAutocompleteWithCustomizationDemoCode,
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
  render: (args: Record<string, unknown>) => <RgoInputAutocompleteWithAsyncDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input with **async options function** for server-side search with debouncing and loading states.",
      },
      source: {
        code: RgoInputAutocompleteWithAsyncDemoCode,
      },
    },
  },
};

export const WithFormInput: Story = {
  name: "With form input",
  render: () => <RgoInputAutocompleteWithFormInputDemo />,
  parameters: {
    docs: {
      description: {
        story: "Input integration with **react-hook-form** and **zod**.",
      },
      source: {
        code: RgoInputAutocompleteWithFormInputDemoCode,
      },
    },
  },
};
