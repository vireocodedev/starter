import { type RgoLoader } from "@/components/feedback/RgoLoader/RgoLoader";
import {
  RgoLoaderWithContainerSizeDemo,
  RgoLoaderWithContainerSizeDemoCode,
} from "@/components/feedback/RgoLoader/stories/RgoLoaderWithContainerSizeDemo";
import {
  RgoLoaderWithDefaultsDemo,
  RgoLoaderWithDefaultsDemoCode,
} from "@/components/feedback/RgoLoader/stories/RgoLoaderWithDefaultsDemo";
import {
  RgoLoaderWithLoaderSizeDemo,
  RgoLoaderWithLoaderSizeDemoCode,
} from "@/components/feedback/RgoLoader/stories/RgoLoaderWithLoaderSizeDemo";
import { type Meta, type StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A loading indicator component that can be used to show a loading state in your application. It is typically used in conjunction with React's Suspense feature to indicate that content is being loaded asynchronously.

## Stories

- [With default props](#with-default-props)
- [With custom loader size](#with-custom-loader-size)
- [With custom container sizes](#with-custom-container-sizes)

## Usage

\`\`\`tsx
${RgoLoaderWithDefaultsDemoCode}
\`\`\``;

const meta: Meta<typeof RgoLoader> = {
  title: "Components/Feedback/RgoLoader",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    containerWidth: {
      control: "text",
      description: "Width of the container that wraps the loader",
      table: {
        type: { summary: "string | number" },
        defaultValue: { summary: "100%" },
      },
    },
    containerHeight: {
      control: "text",
      description: "Height of the container that wraps the loader",
      table: {
        type: { summary: "string | number" },
        defaultValue: { summary: "auto" },
      },
    },
    loaderSize: {
      control: "text",
      description: "Size of the circular progress spinner",
      table: {
        type: { summary: "string | number" },
        defaultValue: { summary: "3rem" },
      },
    },
  },
};

export default meta;
export type Story = StoryObj<typeof meta>;

export const WithDefaults: Story = {
  name: "With default props",
  args: {
    containerWidth: "100%",
    containerHeight: "auto",
    loaderSize: "3rem",
  },
  render: args => <RgoLoaderWithDefaultsDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoLoaderWithDefaultsDemoCode,
      },
    },
  },
};

export const WithLoaderSize: Story = {
  name: "With custom loader size",
  args: {
    containerWidth: "100%",
    containerHeight: "auto",
  },
  argTypes: {
    loaderSize: {
      control: false,
    },
  },
  render: args => <RgoLoaderWithLoaderSizeDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoLoaderWithLoaderSizeDemoCode,
      },
    },
  },
};

export const WithContainerSize: Story = {
  name: "With custom container sizes",
  args: {
    loaderSize: "3rem",
  },
  argTypes: {
    containerWidth: {
      control: false,
    },
    containerHeight: {
      control: false,
    },
  },
  render: args => <RgoLoaderWithContainerSizeDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: RgoLoaderWithContainerSizeDemoCode,
      },
    },
  },
};
