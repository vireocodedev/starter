import { RgoDrawer } from "@/components/feedback/RgoDrawer/RgoDrawer";
import {
  RgoDrawerWithDefaultPropsDemo,
  RgoDrawerWithDefaultPropsDemoCode,
} from "@/components/feedback/RgoDrawer/stories/RgoDrawerWithDefaultPropsDemo";
import {
  RgoDrawerWithLeftAnchorDemo,
  RgoDrawerWithLeftAnchorDemoCode,
} from "@/components/feedback/RgoDrawer/stories/RgoDrawerWithLeftAnchorDemo";
import {
  RgoDrawerWithTemporaryDemo,
  RgoDrawerWithTemporaryDemoCode,
} from "@/components/feedback/RgoDrawer/stories/RgoDrawerWithTemporaryDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A drawer component that wraps MUI Drawer with support for persistent and temporary variants. Handles body overflow during transitions and provides consistent styling.

## Stories

- [With default props](#with-default-props)
- [With temporary](#with-temporary)
- [With left anchor](#with-left-anchor)

## Usage
\`\`\`tsx
${RgoDrawerWithDefaultPropsDemoCode}
\`\`\``;

const meta = {
  title: "Components/Feedback/RgoDrawer",
  component: RgoDrawer,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Controls whether the drawer is open or closed",
      table: {
        type: { summary: "boolean" },
      },
    },
    onClose: {
      control: false,
      description: "Callback fired when the drawer requests to close",
      table: {
        type: { summary: "() => void" },
      },
    },
    temporary: {
      control: "boolean",
      description: "When true, renders a temporary drawer with backdrop. When false, renders a persistent drawer.",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
      },
    },
    anchor: {
      control: "select",
      options: ["left", "right"],
      description: "The side from which the drawer opens",
      table: {
        defaultValue: { summary: '"right"' },
        type: { summary: '"left" | "right"' },
      },
    },
    width: {
      control: "text",
      description: "The width of the drawer",
      table: {
        defaultValue: { summary: '"568px"' },
        type: { summary: "string | number" },
      },
    },
    children: {
      control: false,
      description: "The content to render inside the drawer",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
    onExited: {
      control: false,
      description: "Callback fired after the drawer exit transition completes",
      table: {
        type: { summary: "() => void" },
      },
    },
  },
} satisfies Meta<typeof RgoDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  args: {
    open: false,
    onClose: () => {},
    children: null,
  },
  render: () => <RgoDrawerWithDefaultPropsDemo />,
  parameters: {
    docs: {
      source: {
        code: RgoDrawerWithDefaultPropsDemoCode,
      },
      description: {
        story: "Persistent drawer that opens from the right side with default width.",
      },
    },
  },
};

export const WithTemporary: Story = {
  name: "With temporary",
  args: {
    open: false,
    onClose: () => {},
    children: null,
    temporary: true,
  },
  render: () => <RgoDrawerWithTemporaryDemo />,
  parameters: {
    docs: {
      description: {
        story: "Temporary drawer with a backdrop overlay. Closes when clicking outside.",
      },
      source: {
        code: RgoDrawerWithTemporaryDemoCode,
      },
    },
  },
};

export const WithLeftAnchor: Story = {
  name: "With left anchor",
  args: {
    open: false,
    onClose: () => {},
    children: null,
    anchor: "left",
  },
  render: () => <RgoDrawerWithLeftAnchorDemo />,
  parameters: {
    docs: {
      description: {
        story: "Drawer that opens from the left side.",
      },
      source: {
        code: RgoDrawerWithLeftAnchorDemoCode,
      },
    },
  },
};
