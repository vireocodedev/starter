import { RgoPage } from "@/components/layout/RgoPage/RgoPage";
import {
  RgoPageWithDefaultPropsDemo,
  RgoPageWithDefaultPropsDemoCode,
} from "@/components/layout/RgoPage/stories/RgoPageWithDefaultPropsDemo";
import {
  RgoPageWithFullLayoutDemo,
  RgoPageWithFullLayoutDemoCode,
} from "@/components/layout/RgoPage/stories/RgoPageWithFullLayoutDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A top-level page wrapper component that provides the base layout structure. Typically used together with RgoPageHeader and RgoPageBody to compose a full page.

## Stories

- [With default props](#with-default-props)
- [With full layout](#with-full-layout)

## Usage

\`\`\`tsx
${RgoPageWithDefaultPropsDemoCode}
\`\`\``;

const meta = {
  title: "Components/Layout/RgoPage",
  component: RgoPage,
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
      description: "The page content",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
  },
  args: {
    children: null,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RgoPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoPageWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Basic page wrapper.",
      },
      source: {
        code: RgoPageWithDefaultPropsDemoCode,
      },
    },
  },
};

export const WithFullLayout: Story = {
  name: "With full layout",
  render: () => <RgoPageWithFullLayoutDemo />,
  parameters: {
    docs: {
      description: {
        story: "Page composed with RgoPageHeader and RgoPageBody for a complete layout.",
      },
      source: {
        code: RgoPageWithFullLayoutDemoCode,
      },
    },
  },
};
