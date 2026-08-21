import { type RgoLoaderSuspense } from "@/components/feedback/RgoQueryErrorLoaderSuspense/components/RgoLoaderSuspense/RgoLoaderSuspense";
import {
  RgoLoaderSuspenseWithDefaultsDemo,
  RgoLoaderSuspenseWithDefaultsDemoCode,
} from "@/components/feedback/RgoQueryErrorLoaderSuspense/components/RgoLoaderSuspense/stories/RgoLoaderSuspenseWithDefaultsDemo";
import { type Meta, type StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A wrapper component that provides a loading state while the children are being resolved. It uses React's \`Suspense\` to handle the loading state and accepts either a custom fallback component or its built-in centered progress indicator.

## Stories

- [With default props](#story--internal-rgoloadersuspense--with-defaults--primary-inner)

## Usage

\`\`\`tsx
${RgoLoaderSuspenseWithDefaultsDemoCode}
\`\`\``;

const meta: Meta<typeof RgoLoaderSuspense> = {
  title: "Internal/RgoLoaderSuspense",
  tags: ["autodocs"],
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
  render: () => <RgoLoaderSuspenseWithDefaultsDemo />,
  parameters: {
    docs: {
      source: {
        code: RgoLoaderSuspenseWithDefaultsDemoCode,
      },
    },
  },
};
