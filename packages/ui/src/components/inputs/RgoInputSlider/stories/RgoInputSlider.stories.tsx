import { RgoInputSlider } from "@/components/inputs/RgoInputSlider/RgoInputSlider";
import {
  RgoInputSliderWithCustomizationDemo,
  RgoInputSliderWithCustomizationDemoCode,
} from "@/components/inputs/RgoInputSlider/stories/RgoInputSliderWithCustomizationDemo";
import {
  RgoInputSliderWithDefaultPropsDemo,
  RgoInputSliderWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoInputSlider/stories/RgoInputSliderWithDefaultPropsDemo";
import {
  RgoInputSliderWithDisabledDemo,
  RgoInputSliderWithDisabledDemoCode,
} from "@/components/inputs/RgoInputSlider/stories/RgoInputSliderWithDisabledDemo";
import {
  RgoInputSliderWithErrorDemo,
  RgoInputSliderWithErrorDemoCode,
} from "@/components/inputs/RgoInputSlider/stories/RgoInputSliderWithErrorDemo";
import {
  RgoInputSliderWithFormInputDemo,
  RgoInputSliderWithFormInputDemoCode,
} from "@/components/inputs/RgoInputSlider/stories/RgoInputSliderWithFormInputDemo";
import {
  RgoInputSliderWithHelperTextDemo,
  RgoInputSliderWithHelperTextDemoCode,
} from "@/components/inputs/RgoInputSlider/stories/RgoInputSliderWithHelperTextDemo";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription, storybookInputComponentArgTypes } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORYBOOK_COMPONENT = RgoInputSlider;
const STORYBOOK_TITLE = "Components/Inputs/RgoInputSlider";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const STORYBOOK_USAGE_CODE = RgoInputSliderWithDefaultPropsDemoCode;
const INPUT_DESCRIPTION = "Input component for numeric values with slider and number input controls.";
const INPUT_VALUE_DESCRIPTION = "The numeric value or null for no selection";
const INPUT_VALUE_TYPE = "number | null";
const INPUT_SLOT_NAMES = [
  "formControl",
  "gridContainer",
  "gridSliderIconContainer",
  "gridSliderContainer",
  "gridNumberInputContainer",
  "slider",
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
    sliderInputIcon: {
      control: false,
    },
    numberInputIcon: {
      control: false,
    },
    numberInputMaxWidth: {
      control: "number",
      description: "Max width of the number input in pixels",
      defaultValue: 80,
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
  render: args => <RgoInputSliderWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoInputSliderWithDefaultPropsDemoCode,
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
  render: args => <RgoInputSliderWithHelperTextDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input with helpful guidance text displayed.",
      },
      source: {
        code: RgoInputSliderWithHelperTextDemoCode,
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
  render: args => <RgoInputSliderWithErrorDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in error state.",
      },
      source: {
        code: RgoInputSliderWithErrorDemoCode,
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
  render: args => <RgoInputSliderWithDisabledDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input in disabled state.",
      },
      source: {
        code: RgoInputSliderWithDisabledDemoCode,
      },
    },
  },
};

export const WithCustomization: Story = {
  name: "With customization",
  args: {
    disabled: false,
    error: false,
    helperText: "Example input with custom styling and icons",
  },
  render: args => <RgoInputSliderWithCustomizationDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Input using **rgoSlotProps** to customize internal components.",
      },
      source: {
        code: RgoInputSliderWithCustomizationDemoCode,
      },
    },
  },
};

export const WithFormInput: Story = {
  name: "With form input",
  render: () => <RgoInputSliderWithFormInputDemo />,
  parameters: {
    docs: {
      description: {
        story: "Input integration with **react-hook-form** and **zod**.",
      },
      source: {
        code: RgoInputSliderWithFormInputDemoCode,
      },
    },
  },
};
