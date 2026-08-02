import { RgoPageBody } from "@/components/layout/RgoPageBody/RgoPageBody";
import {
  RgoPageBodyWithDefaultPropsDemo,
  RgoPageBodyWithDefaultPropsDemoCode,
} from "@/components/layout/RgoPageBody/stories/RgoPageBodyWithDefaultPropsDemo";
import {
  RgoPageBodyWithDrawerDemo,
  RgoPageBodyWithDrawerDemoCode,
} from "@/components/layout/RgoPageBody/stories/RgoPageBodyWithDrawerDemo";
import {
  RgoPageBodyWithMaxWidthDemo,
  RgoPageBodyWithMaxWidthDemoCode,
} from "@/components/layout/RgoPageBody/stories/RgoPageBodyWithMaxWidthDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

The main content area of a page layout. Wraps content in a MUI Container with configurable max width and an optional side drawer slot.

## Stories

- [With default props](#with-default-props)
- [With max width](#with-max-width)
- [With drawer](#with-drawer)

## Usage

\`\`\`tsx
${RgoPageBodyWithDefaultPropsDemoCode}
\`\`\``;

const meta = {
  title: "Components/Layout/RgoPageBody",
  component: RgoPageBody,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    children: {
      control: false,
      description: "The page body content",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
    maxWidth: {
      control: "select",
      options: [false, "xs", "sm", "md", "lg", "xl"],
      description: "Maximum width of the content container",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: '"xs" | "sm" | "md" | "lg" | "xl" | false' },
      },
    },
    drawer: {
      control: false,
      description: "Optional drawer element rendered alongside the content",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
  },
  args: {
    children: null,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RgoPageBody>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: args => <RgoPageBodyWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Page body with default full-width layout.",
      },
      source: {
        code: RgoPageBodyWithDefaultPropsDemoCode,
      },
    },
  },
};

export const WithMaxWidth: Story = {
  name: "With max width",
  render: () => <RgoPageBodyWithMaxWidthDemo />,
  parameters: {
    docs: {
      description: {
        story: "Page body with constrained max width.",
      },
      source: {
        code: RgoPageBodyWithMaxWidthDemoCode,
      },
    },
  },
};

export const WithDrawer: Story = {
  name: "With drawer",
  render: () => <RgoPageBodyWithDrawerDemo />,
  parameters: {
    docs: {
      description: {
        story: "Page body with a persistent side drawer.",
      },
      source: {
        code: RgoPageBodyWithDrawerDemoCode,
      },
    },
  },
};
