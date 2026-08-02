import { RgoSnack } from "@/components/data-display/RgoSnack/RgoSnack";
import {
  RgoSnackWithDefaultPropsDemo,
  RgoSnackWithDefaultPropsDemoCode,
} from "@/components/data-display/RgoSnack/stories/RgoSnackWithDefaultPropsDemo";
import {
  RgoSnackWithIconDemo,
  RgoSnackWithIconDemoCode,
} from "@/components/data-display/RgoSnack/stories/RgoSnackWithIconDemo";
import {
  RgoSnackWithLoaderAndIconDemo,
  RgoSnackWithLoaderAndIconDemoCode,
} from "@/components/data-display/RgoSnack/stories/RgoSnackWithLoaderAndIconDemo";
import {
  RgoSnackWithLoaderDemo,
  RgoSnackWithLoaderDemoCode,
} from "@/components/data-display/RgoSnack/stories/RgoSnackWithLoaderDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A component for displaying snack messages with optional icons and loading states. Ideal for notifications, alerts, and status updates in the UI.

## Stories

- [With default props](#with-default-props)
- [With loader](#with-loader)
- [With icon](#with-icon)
- [With loader and icon](#with-loader-and-icon)

## Usage
\`\`\`tsx
${RgoSnackWithDefaultPropsDemoCode}
\`\`\``;

const meta: Meta<typeof RgoSnack> = {
  title: "Components/Data display/RgoSnack",
  component: RgoSnack,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    message: {
      control: "text",
      description: "The message text to display in the snack",
    },
    startAdornment: {
      control: false,
      description: "Optional node to display before the message (e.g. icon or spinner)",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
    endAdornment: {
      control: false,
      description: "Optional node to display after the message",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  args: {
    message: "This is a snack message",
  },
  render: args => <RgoSnackWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Basic usage of RgoSnack with only the required message prop.",
      },
      source: {
        code: RgoSnackWithDefaultPropsDemoCode,
      },
    },
  },
};

export const WithLoader: Story = {
  name: "With loader",
  render: () => <RgoSnackWithLoaderDemo />,
  parameters: {
    docs: {
      description: {
        story: "RgoSnack with loading spinner to indicate ongoing operations.",
      },
      source: {
        code: RgoSnackWithLoaderDemoCode,
      },
    },
  },
};

export const WithIcon: Story = {
  name: "With icon",
  render: () => <RgoSnackWithIconDemo />,
  parameters: {
    docs: {
      description: {
        story: "RgoSnack with an icon to provide visual context for the message.",
      },
      source: {
        code: RgoSnackWithIconDemoCode,
      },
    },
  },
};

export const WithLoaderAndIcon: Story = {
  name: "With loader and icon",
  render: () => <RgoSnackWithLoaderAndIconDemo />,
  parameters: {
    docs: {
      description: {
        story: "RgoSnack with both icon and loader. Note that both will be displayed when both props are provided.",
      },
      source: {
        code: RgoSnackWithLoaderAndIconDemoCode,
      },
    },
  },
};
