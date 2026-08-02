import { RgoQueryErrorBoundary } from "@/components/feedback/RgoQueryErrorLoaderSuspense/components/RgoQueryErrorBoundary/RgoQueryErrorBoundary";
import {
  RgoQueryErrorBoundaryWithDefaultsDemo,
  RgoQueryErrorBoundaryWithDefaultsDemoCode,
} from "@/components/feedback/RgoQueryErrorLoaderSuspense/components/RgoQueryErrorBoundary/stories/RgoQueryErrorBoundaryWithDefaultsDemo";
import {
  RgoQueryErrorBoundaryWithFallbackDemo,
  RgoQueryErrorBoundaryWithFallbackDemoCode,
} from "@/components/feedback/RgoQueryErrorLoaderSuspense/components/RgoQueryErrorBoundary/stories/RgoQueryErrorBoundaryWithFallbackDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A custom React query-aware error boundary that provides automatic error recovery and retry functionality. It wraps components to catch JavaScript errors and display a fallback UI with reset capabilities.

## Stories

- [With default props](#with-default-props)
- [With custom fallback](#with-custom-fallback)

## Usage

\`\`\`tsx
${RgoQueryErrorBoundaryWithDefaultsDemoCode}
\`\`\``;

const meta: Meta<typeof RgoQueryErrorBoundary> = {
  title: "Internal/RgoQueryErrorBoundary",
  component: RgoQueryErrorBoundary,
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
      description: "The content to be wrapped by the error boundary",
    },
    FallbackComponent: {
      control: false,
      description: "Optional custom fallback component to display when an error occurs",
      table: {
        type: { summary: "React.ComponentType<FallbackProps> | undefined" },
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaults: Story = {
  name: "With default props",
  render: () => <RgoQueryErrorBoundaryWithDefaultsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Error boundary with default error fallback UI.",
      },
      source: {
        code: RgoQueryErrorBoundaryWithDefaultsDemoCode,
      },
    },
  },
};

export const WithFallback: Story = {
  name: "With custom fallback",
  render: () => <RgoQueryErrorBoundaryWithFallbackDemo />,
  parameters: {
    docs: {
      description: {
        story: "Error boundary with a custom fallback component.",
      },
      source: {
        code: RgoQueryErrorBoundaryWithFallbackDemoCode,
      },
    },
  },
};
