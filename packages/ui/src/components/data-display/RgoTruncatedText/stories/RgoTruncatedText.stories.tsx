import { RgoTruncatedText } from "@/components/data-display/RgoTruncatedText/RgoTruncatedText";
import {
  RgoTruncatedTextWithCustomActionTextDemo,
  RgoTruncatedTextWithCustomActionTextDemoCode,
} from "@/components/data-display/RgoTruncatedText/stories/RgoTruncatedTextWithCustomActionTextDemo";
import {
  RgoTruncatedTextWithDefaultPropsDemo,
  RgoTruncatedTextWithDefaultPropsDemoCode,
} from "@/components/data-display/RgoTruncatedText/stories/RgoTruncatedTextWithDefaultPropsDemo";
import {
  RgoTruncatedTextWithDifferentRowLimitsDemo,
  RgoTruncatedTextWithDifferentRowLimitsDemoCode,
} from "@/components/data-display/RgoTruncatedText/stories/RgoTruncatedTextWithDifferentRowLimitsDemo";
import {
  RgoTruncatedTextWithDifferentWidthsDemo,
  RgoTruncatedTextWithDifferentWidthsDemoCode,
} from "@/components/data-display/RgoTruncatedText/stories/RgoTruncatedTextWithDifferentWidthsDemo";
import {
  RgoTruncatedTextWithIconsDemo,
  RgoTruncatedTextWithIconsDemoCode,
} from "@/components/data-display/RgoTruncatedText/stories/RgoTruncatedTextWithIconsDemo";
import {
  RgoTruncatedTextWithNoTruncationDemo,
  RgoTruncatedTextWithNoTruncationDemoCode,
} from "@/components/data-display/RgoTruncatedText/stories/RgoTruncatedTextWithNoTruncationDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A component that displays text with truncation and expand/collapse functionality. Allows users to view more content when text exceeds the specified maximum rows. Supports custom icons and internationalization.

## Stories

- [With default props](#with-default-props)
- [With icons](#with-icons)
- [With different widths](#with-different-widths)
- [With different row limits](#with-different-row-limits)
- [With custom action text](#with-custom-action-text)
- [With no truncation](#with-no-truncation)

## Usage

\`\`\`tsx
${RgoTruncatedTextWithDefaultPropsDemoCode}
\`\`\``;

const meta: Meta<typeof RgoTruncatedText> = {
  title: "Components/Data display/RgoTruncatedText",
  component: RgoTruncatedText,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    text: {
      control: "text",
      description: "The text content to display",
    },
    maxWidth: {
      control: "text",
      description: "Maximum width of the text container (number or string with units)",
      table: {
        type: { summary: "string | number" },
        defaultValue: { summary: "300px" },
      },
    },
    maxRows: {
      control: "number",
      description: "Maximum number of rows to display before truncation",
    },
    viewMoreText: {
      control: "text",
      description: "Text to display for the 'view more' action",
      table: {
        defaultValue: { summary: '"View more"' },
      },
    },
    viewLessText: {
      control: "text",
      description: "Text to display for the 'view less' action",
      table: {
        defaultValue: { summary: '"View less"' },
      },
    },
    startIcon: {
      control: false,
      description: "Optional icon to display at the start of the text",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const longText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`;

export const WithDefaultProps: Story = {
  name: "With default props",
  args: {
    text: longText,
    maxRows: 2,
    maxWidth: "300px",
    viewMoreText: "View more",
    viewLessText: "View less",
  },
  render: args => <RgoTruncatedTextWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Basic usage with only the required text prop. Uses default values for all optional props.",
      },
      source: {
        code: RgoTruncatedTextWithDefaultPropsDemoCode,
      },
    },
  },
};

export const WithIcons: Story = {
  name: "With icons",
  render: () => <RgoTruncatedTextWithIconsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Examples with different icons to show how the component works with various start icons.",
      },
      source: {
        code: RgoTruncatedTextWithIconsDemoCode,
      },
    },
  },
};

export const WithDifferentWidths: Story = {
  name: "With different widths",
  render: () => <RgoTruncatedTextWithDifferentWidthsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Examples showing how the component behaves with different width constraints.",
      },
      source: {
        code: RgoTruncatedTextWithDifferentWidthsDemoCode,
      },
    },
  },
};

export const WithDifferentRowLimits: Story = {
  name: "With different row limits",
  render: () => <RgoTruncatedTextWithDifferentRowLimitsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Examples demonstrating different row limits and how they affect text truncation.",
      },
      source: {
        code: RgoTruncatedTextWithDifferentRowLimitsDemoCode,
      },
    },
  },
};

export const WithCustomActionText: Story = {
  name: "With custom action text",
  render: () => <RgoTruncatedTextWithCustomActionTextDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Examples with customized action text for expand/collapse functionality, useful for internationalization.",
      },
      source: {
        code: RgoTruncatedTextWithCustomActionTextDemoCode,
      },
    },
  },
};

export const WithNoTruncation: Story = {
  name: "With no truncation",
  render: () => <RgoTruncatedTextWithNoTruncationDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Examples where the text is short enough that no truncation occurs. The expand/collapse functionality should not be visible.",
      },
      source: {
        code: RgoTruncatedTextWithNoTruncationDemoCode,
      },
    },
  },
};
