import { RgoPageHeader } from "@/components/layout/RgoPageHeader/RgoPageHeader";
import {
  RgoPageHeaderWithBackButtonDemo,
  RgoPageHeaderWithBackButtonDemoCode,
} from "@/components/layout/RgoPageHeader/stories/RgoPageHeaderWithBackButtonDemo";
import {
  RgoPageHeaderWithChildrenDemo,
  RgoPageHeaderWithChildrenDemoCode,
} from "@/components/layout/RgoPageHeader/stories/RgoPageHeaderWithChildrenDemo";
import {
  RgoPageHeaderWithDefaultPropsDemo,
  RgoPageHeaderWithDefaultPropsDemoCode,
} from "@/components/layout/RgoPageHeader/stories/RgoPageHeaderWithDefaultPropsDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A page header component that displays a title with an optional back button and additional children content. Provides a consistent header layout for pages.

## Stories

- [With default props](#with-default-props)
- [With back button](#with-back-button)
- [With children](#with-children)

## Usage

\`\`\`tsx
${RgoPageHeaderWithDefaultPropsDemoCode}
\`\`\``;

const meta = {
  title: "Components/Layout/RgoPageHeader",
  component: RgoPageHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    title: {
      control: "text",
      description: "The title content displayed in the header",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
    backButton: {
      control: false,
      description: "Optional back button element displayed before the title",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
    children: {
      control: false,
      description: "Optional additional content displayed after the title",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RgoPageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  args: {
    title: "Page Title",
  },
  render: args => <RgoPageHeaderWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Basic page header with a title.",
      },
      source: {
        code: RgoPageHeaderWithDefaultPropsDemoCode,
      },
    },
  },
};

export const WithBackButton: Story = {
  name: "With back button",
  render: () => <RgoPageHeaderWithBackButtonDemo />,
  parameters: {
    docs: {
      description: {
        story: "Page header with a back navigation button.",
      },
      source: {
        code: RgoPageHeaderWithBackButtonDemoCode,
      },
    },
  },
};

export const WithChildren: Story = {
  name: "With children",
  render: () => <RgoPageHeaderWithChildrenDemo />,
  parameters: {
    docs: {
      description: {
        story: "Page header with additional action buttons and status chips.",
      },
      source: {
        code: RgoPageHeaderWithChildrenDemoCode,
      },
    },
  },
};
