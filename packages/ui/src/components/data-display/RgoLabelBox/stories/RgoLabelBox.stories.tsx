import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import {
  RgoLabelBoxWithCustomColorDemo,
  RgoLabelBoxWithCustomColorDemoCode,
} from "@/components/data-display/RgoLabelBox/stories/RgoLabelBoxWithCustomColorDemo";
import {
  RgoLabelBoxWithDefaultPropsDemo,
  RgoLabelBoxWithDefaultPropsDemoCode,
} from "@/components/data-display/RgoLabelBox/stories/RgoLabelBoxWithDefaultPropsDemo";
import {
  RgoLabelBoxWithDifferentFontWeightsDemo,
  RgoLabelBoxWithDifferentFontWeightsDemoCode,
} from "@/components/data-display/RgoLabelBox/stories/RgoLabelBoxWithDifferentFontWeightsDemo";
import {
  RgoLabelBoxWithHelperTextDemo,
  RgoLabelBoxWithHelperTextDemoCode,
} from "@/components/data-display/RgoLabelBox/stories/RgoLabelBoxWithHelperTextDemo";
import {
  RgoLabelBoxWithMultipleFormElementsDemo,
  RgoLabelBoxWithMultipleFormElementsDemoCode,
} from "@/components/data-display/RgoLabelBox/stories/RgoLabelBoxWithMultipleFormElementsDemo";
import {
  RgoLabelBoxWithNonFormContentDemo,
  RgoLabelBoxWithNonFormContentDemoCode,
} from "@/components/data-display/RgoLabelBox/stories/RgoLabelBoxWithNonFormContentDemo";
import {
  RgoLabelBoxWithRequiredIndicatorDemo,
  RgoLabelBoxWithRequiredIndicatorDemoCode,
} from "@/components/data-display/RgoLabelBox/stories/RgoLabelBoxWithRequiredIndicatorDemo";
import { TextField } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A wrapper component that provides consistent labeling, styling, and optional helper text for form inputs and other content. It organizes labels, helper text, and content in a standardized layout.

## Stories
- [With default props](#with-default-props)
- [With label](#with-label)
- [With helper text](#with-helper-text)
- [With required indicator](#with-required-indicator)
- [With custom color](#with-custom-color)
- [With different font weights](#with-different-font-weights)
- [With multiple form elements](#with-multiple-form-elements)
- [With non-form content](#with-non-form-content)

## Usage

\`\`\`tsx
${RgoLabelBoxWithDefaultPropsDemoCode}
\`\`\``;

const meta: Meta<typeof RgoLabelBox> = {
  title: "Components/Data display/RgoLabelBox",
  component: RgoLabelBox,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    label: {
      control: "text",
      description: "The main label text displayed above the content",
    },
    helperText: {
      control: "text",
      description: "Additional helper text displayed below the label",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
    children: {
      control: false,
      description: "The content to be wrapped by the label box",
    },
    color: {
      control: "color",
      description: "Color of the label text",
      table: {
        type: { summary: "string | ((theme: Theme) => string)" },
      },
    },
    required: {
      control: "boolean",
      description: "Whether to show a required asterisk (*) after the label",
    },
    fontWeight: {
      control: "select",
      options: [300, 400, 500, 600, 700],
      description: "Font weight of the label text",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  args: {
    label: "Default label",
    helperText: "",
    required: false,
    color: "var(--mui-palette-grey-700)",
    fontWeight: 500,
    children: <TextField variant="outlined" placeholder="Enter some text..." fullWidth />,
  },
  render: args => <RgoLabelBoxWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Basic usage of RgoLabelBox with only required props (children).",
      },
      source: {
        code: RgoLabelBoxWithDefaultPropsDemoCode,
      },
    },
  },
};

export const WithHelperText: Story = {
  name: "With helper text",
  render: () => <RgoLabelBoxWithHelperTextDemo />,
  parameters: {
    docs: {
      description: {
        story: "RgoLabelBox with both label and helper text.",
      },
      source: {
        code: RgoLabelBoxWithHelperTextDemoCode,
      },
    },
  },
};

export const WithRequiredIndicator: Story = {
  name: "With required indicator",
  render: () => <RgoLabelBoxWithRequiredIndicatorDemo />,
  parameters: {
    docs: {
      description: {
        story: "RgoLabelBox with required field indicator (asterisk).",
      },
      source: {
        code: RgoLabelBoxWithRequiredIndicatorDemoCode,
      },
    },
  },
};

export const WithCustomColor: Story = {
  name: "With custom color",
  render: () => <RgoLabelBoxWithCustomColorDemo />,
  parameters: {
    docs: {
      description: {
        story: "RgoLabelBox with custom label color.",
      },
      source: {
        code: RgoLabelBoxWithCustomColorDemoCode,
      },
    },
  },
};

export const WithDifferentFontWeights: Story = {
  name: "With different font weights",
  render: () => <RgoLabelBoxWithDifferentFontWeightsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Demonstrates different font weight options for the label.",
      },
      source: {
        code: RgoLabelBoxWithDifferentFontWeightsDemoCode,
      },
    },
  },
};

export const WithMultipleFormElements: Story = {
  name: "With multiple form elements",
  render: () => <RgoLabelBoxWithMultipleFormElementsDemo />,
  parameters: {
    docs: {
      description: {
        story: "RgoLabelBox containing multiple child elements.",
      },
      source: {
        code: RgoLabelBoxWithMultipleFormElementsDemoCode,
      },
    },
  },
};

export const WithNonFormContent: Story = {
  name: "With non-form content",
  render: () => <RgoLabelBoxWithNonFormContentDemo />,
  parameters: {
    docs: {
      description: {
        story: "RgoLabelBox used with non-form content like information displays.",
      },
      source: {
        code: RgoLabelBoxWithNonFormContentDemoCode,
      },
    },
  },
};
