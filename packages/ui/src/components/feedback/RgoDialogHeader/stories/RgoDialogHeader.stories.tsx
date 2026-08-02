import { RgoDialogHeader } from "@/components/feedback/RgoDialogHeader/RgoDialogHeader";
import {
  RgoDialogHeaderWithChildrenDemo,
  RgoDialogHeaderWithChildrenDemoCode,
} from "@/components/feedback/RgoDialogHeader/stories/RgoDialogHeaderWithChildrenDemo";
import {
  RgoDialogHeaderWithDefaultPropsDemo,
  RgoDialogHeaderWithDefaultPropsDemoCode,
} from "@/components/feedback/RgoDialogHeader/stories/RgoDialogHeaderWithDefaultPropsDemo";
import {
  RgoDialogHeaderWithDifferentColorsDemo,
  RgoDialogHeaderWithDifferentColorsDemoCode,
} from "@/components/feedback/RgoDialogHeader/stories/RgoDialogHeaderWithDifferentColorsDemo";
import {
  RgoDialogHeaderWithOnCloseHandlerDemo,
  RgoDialogHeaderWithOnCloseHandlerDemoCode,
} from "@/components/feedback/RgoDialogHeader/stories/RgoDialogHeaderWithOnCloseHandlerDemo";
import {
  RgoDialogHeaderWithReactNodeTitleDemo,
  RgoDialogHeaderWithReactNodeTitleDemoCode,
} from "@/components/feedback/RgoDialogHeader/stories/RgoDialogHeaderWithReactNodeTitleDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A header component for dialogs that displays a title, optional colored styling, action buttons, and a close button. Provides consistent styling and layout for dialog headers across the application.

## Stories

- [With default props](#with-default-props)
- [With different colors](#with-different-colors)
- [With onClose handler](#with-onclose-handler)
- [With children](#with-children)
- [With ReactNode title](#with-reactnode-title)

## Usage
\`\`\`tsx
${RgoDialogHeaderWithDefaultPropsDemoCode}
\`\`\``;

const meta = {
  title: "Components/Feedback/RgoDialogHeader",
  component: RgoDialogHeader,
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
      description: "The title content displayed in the dialog header",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
    color: {
      control: "select",
      options: [undefined, "error", "primary", "secondary", "info", "success", "warning"],
      description: "Theme color variant for the title text",
      table: {
        type: {
          summary: "error | primary | secondary | info | success | warning",
        },
      },
    },
    onClose: {
      control: false,
      description: "Callback function called when the close button is clicked",
    },
    children: {
      control: false,
      description: "Optional action buttons or other content displayed in the header",
      table: {
        type: {
          summary: "React.ReactNode",
        },
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RgoDialogHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  args: {
    title: "Dialog Title",
    color: undefined,
  },
  render: args => <RgoDialogHeaderWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Basic dialog header.",
      },
      source: {
        code: RgoDialogHeaderWithDefaultPropsDemoCode,
      },
    },
  },
};

export const WithDifferentColors: Story = {
  name: "With different colors",
  render: args => <RgoDialogHeaderWithDifferentColorsDemo {...args} />,
  args: {
    title: "Dialog Title",
  },
  argTypes: {
    color: {
      control: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Basic dialog header with different color variants.",
      },
      source: {
        code: RgoDialogHeaderWithDifferentColorsDemoCode,
      },
    },
  },
};

export const WithOnCloseHandler: Story = {
  name: "With onClose handler",
  args: {
    title: "Dialog Title",
  },
  render: args => <RgoDialogHeaderWithOnCloseHandlerDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Basic dialog header with close button.",
      },
      source: {
        code: RgoDialogHeaderWithOnCloseHandlerDemoCode,
      },
    },
  },
};

export const WithChildren: Story = {
  name: "With children",
  args: {
    title: "Dialog Title",
  },
  render: args => <RgoDialogHeaderWithChildrenDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Dialog header with custom children content, such as action buttons or status chips.",
      },
      source: {
        code: RgoDialogHeaderWithChildrenDemoCode,
      },
    },
  },
};

export const WithReactNodeTitle: Story = {
  name: "With ReactNode title",
  render: args => <RgoDialogHeaderWithReactNodeTitleDemo {...args} />,
  args: {
    title: undefined,
  },
  argTypes: {
    title: {
      control: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Examples showing how React nodes can be used as titles for more complex header content.",
      },
      source: {
        code: RgoDialogHeaderWithReactNodeTitleDemoCode,
      },
    },
  },
};
