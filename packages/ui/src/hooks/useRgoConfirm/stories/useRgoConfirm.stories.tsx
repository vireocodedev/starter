import {
  UseConfirmWithColorsDemo,
  UseConfirmWithColorsDemoCode,
} from "@/hooks/useRgoConfirm/stories/UseRgoConfirmWithColorsDemo";
import {
  UseConfirmWithDefaultsDemo,
  UseConfirmWithDefaultsDemoCode,
} from "@/hooks/useRgoConfirm/stories/UseRgoConfirmWithDefaultsDemo";
import {
  UseConfirmWithHtmlStringMessageDemo,
  UseConfirmWithHtmlStringMessageDemoCode,
} from "@/hooks/useRgoConfirm/stories/UseRgoConfirmWithHtmlStringMessageDemo";
import {
  UseConfirmWithReactJsxMessageDemo,
  UseConfirmWithReactJsxMessageDemoCode,
} from "@/hooks/useRgoConfirm/stories/UseRgoConfirmWithReactJsxMessageDemo";
import {
  UseConfirmWithSizesDemo,
  UseConfirmWithSizesDemoCode,
} from "@/hooks/useRgoConfirm/stories/UseRgoConfirmWithSizesDemo";
import { RgoConfirmProvider } from "@/providers/RgoConfirmProvider/RgoConfirmProvider";
import { createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const USE_CONFIRM_DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "A custom React hook that provides a simple way to show confirmation dialogs in your application. It allows you to easily trigger confirmation dialogs with customizable options like title, message, confirm text, cancel text, and more.",
  stories: [
    { name: "With default props", anchor: "with-default-props" },
    { name: "With different colors", anchor: "with-different-colors" },
    { name: "With different sizes", anchor: "with-different-sizes" },
    { name: "With React JSX message", anchor: "with-react-jsx-message" },
    { name: "With HTML string message", anchor: "with-html-string-message" },
  ],
  setup: {
    steps: [
      {
        title: "Register provider",
        code: `import { RgoConfirmProvider } from "@vireocodedev/starter-ui";

export function App() {
  return (
    <RgoConfirmProvider>
      {/* your app code... */}
    </RgoConfirmProvider>
  );
}`,
      },
    ],
  },
  usage: UseConfirmWithDefaultsDemoCode,
});

const meta: Meta<typeof RgoConfirmProvider> = {
  title: "Hooks/useRgoConfirm",
  tags: ["autodocs"],
  component: RgoConfirmProvider,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: USE_CONFIRM_DESCRIPTION,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <UseConfirmWithDefaultsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Basic usage of the useRgoConfirm hook. Shows a simple confirmation dialog with async delete operation handling.",
      },
      source: {
        code: UseConfirmWithDefaultsDemoCode,
      },
    },
  },
};

export const WithDifferentColors: Story = {
  name: "With different colors",
  render: () => <UseConfirmWithColorsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates different color variants available for confirmation dialogs, suitable for different types of actions.",
      },
      source: {
        code: UseConfirmWithColorsDemoCode,
      },
    },
  },
};

export const WithDifferentSizes: Story = {
  name: "With different sizes",
  render: () => <UseConfirmWithSizesDemo />,
  parameters: {
    docs: {
      description: {
        story: "Shows different dialog sizes (maxWidth) options available for confirmation dialogs.",
      },
      source: {
        code: UseConfirmWithSizesDemoCode,
      },
    },
  },
};

export const WithReactJsxMessage: Story = {
  name: "With React JSX message",
  render: () => <UseConfirmWithReactJsxMessageDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Shows how to use React components as dialog content, allowing for complex layouts and interactive elements.",
      },
      source: {
        code: UseConfirmWithReactJsxMessageDemoCode,
      },
    },
  },
};

export const WithHtmlStringMessage: Story = {
  name: "With HTML string message",
  render: () => <UseConfirmWithHtmlStringMessageDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Shows how to use HTML strings as dialog content, allowing for formatted messages with links and styles.",
      },
      source: {
        code: UseConfirmWithHtmlStringMessageDemoCode,
      },
    },
  },
};
