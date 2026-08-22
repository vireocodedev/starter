import DefaultExample from "@/core/components/behavior/VireoInitializationBoundary/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/behavior/VireoInitializationBoundary/internal/storybook/DefaultExample.tsx?raw";
import FailureAndRetryExample from "@/core/components/behavior/VireoInitializationBoundary/internal/storybook/FailureAndRetryExample";
import failureAndRetryExampleSource from "@/core/components/behavior/VireoInitializationBoundary/internal/storybook/FailureAndRetryExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoInitializationBoundary } from "./VireoInitializationBoundary";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "UI/Core/Behavior/VireoInitializationBoundary",
  component: VireoInitializationBoundary,
  tags: ["autodocs"],
  args: { initialize: () => undefined, children: null },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Gates a React subtree until an abortable asynchronous initialization lifecycle is ready.\n\n### Why it exists\n\nApplication roots and capability subtrees repeatedly need pending presentation, cancellation, cleanup, restart, and error-boundary propagation around initialization. Vireo owns that lifecycle boundary so consumers do not rebuild subtly unsafe effects. Use it when descendants must not mount before a resource is ready; use an ordinary effect when rendering may proceed independently.",
      },
    },
  },
} satisfies Meta<typeof VireoInitializationBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: {
    ...source(defaultExampleSource),
    docs: {
      ...source(defaultExampleSource).docs,
      description: { story: "Restarts the complete lifecycle on demand." },
    },
  },
};

export const FailureAndRetry: Story = {
  render: () => <FailureAndRetryExample />,
  parameters: {
    ...source(failureAndRetryExampleSource),
    docs: {
      ...source(failureAndRetryExampleSource).docs,
      description: { story: "Lets the nearest error boundary own failure presentation and retry by remounting." },
    },
  },
};
