import { type RgoQueryErrorLoaderSuspense } from "@/components/feedback/RgoQueryErrorLoaderSuspense/RgoQueryErrorLoaderSuspense";
import {
  RgoQueryErrorLoaderSuspenseWithDefaultsDemo,
  RgoQueryErrorLoaderSuspenseWithDefaultsDemoCode,
} from "@/components/feedback/RgoQueryErrorLoaderSuspense/stories/RgoQueryErrorLoaderSuspenseWithDefaultsDemo";
import {
  RgoQueryErrorLoaderSuspenseWithErrorComponentDemo,
  RgoQueryErrorLoaderSuspenseWithErrorComponentDemoCode,
} from "@/components/feedback/RgoQueryErrorLoaderSuspense/stories/RgoQueryErrorLoaderSuspenseWithErrorComponentDemo";
import {
  RgoQueryErrorLoaderSuspenseWithLoaderComponentDemo,
  RgoQueryErrorLoaderSuspenseWithLoaderComponentDemoCode,
} from "@/components/feedback/RgoQueryErrorLoaderSuspense/stories/RgoQueryErrorLoaderSuspenseWithLoaderComponentDemo";
import { type Meta, type StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A wrapper component that combines error handling and loading states for React Query operations. It uses \`RgoQueryErrorBoundary\` to catch errors and \`RgoLoaderSuspense\` to show a loading state while the query is being resolved.

## Stories

- [With default props](#with-default-props)
- [With custom error component](#with-custom-error-component)
- [With custom loader component](#with-custom-loader-component)

## Usage

\`\`\`tsx
${RgoQueryErrorLoaderSuspenseWithDefaultsDemoCode}
\`\`\``;

const meta: Meta<typeof RgoQueryErrorLoaderSuspense> = {
  title: "Components/Feedback/RgoQueryErrorLoaderSuspense",
  tags: ["autodocs"],
  argTypes: {
    ErrorComponent: {
      control: false,
      description: "Custom error component to display when an error occurs",
      table: {
        type: { summary: "React.ComponentType<FallbackProps>" },
      },
    },
    LoaderComponent: {
      control: false,
      description: "Custom loader component to display while the query is loading",
      table: {
        type: { summary: "React.ComponentType" },
      },
    },
    children: {
      control: false,
      description: "The content to be rendered when the query is successful",
    },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
};

export default meta;
export type Story = StoryObj<typeof meta>;

export const WithDefaults: Story = {
  name: "With default props",
  render: () => <RgoQueryErrorLoaderSuspenseWithDefaultsDemo />,
  parameters: {
    docs: {
      source: {
        code: RgoQueryErrorLoaderSuspenseWithDefaultsDemoCode,
      },
    },
  },
};

export const WithErrorComponent: Story = {
  name: "With custom error component",
  render: () => <RgoQueryErrorLoaderSuspenseWithErrorComponentDemo />,
  parameters: {
    docs: {
      source: {
        code: RgoQueryErrorLoaderSuspenseWithErrorComponentDemoCode,
      },
    },
  },
};

export const WithLoaderComponent: Story = {
  name: "With custom loader component",
  render: () => <RgoQueryErrorLoaderSuspenseWithLoaderComponentDemo />,
  parameters: {
    docs: {
      source: {
        code: RgoQueryErrorLoaderSuspenseWithLoaderComponentDemoCode,
      },
    },
  },
};
