import DefaultExample from "@/core/components/behavior/VireoInitializationBoundary/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/behavior/VireoInitializationBoundary/internal/storybook/DefaultExample.tsx?raw";
import ErrorExample from "@/core/components/behavior/VireoInitializationBoundary/internal/storybook/ErrorExample";
import errorExampleSource from "@/core/components/behavior/VireoInitializationBoundary/internal/storybook/ErrorExample.tsx?raw";
import LoadingExample from "@/core/components/behavior/VireoInitializationBoundary/internal/storybook/LoadingExample";
import loadingExampleSource from "@/core/components/behavior/VireoInitializationBoundary/internal/storybook/LoadingExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoInitializationBoundary } from "./VireoInitializationBoundary";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "TypeScript/UI/Core/Behavior/VireoInitializationBoundary",
  component: VireoInitializationBoundary,
  tags: ["autodocs"],
  args: { initialize: () => undefined, children: null },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Gates a React subtree until an abortable asynchronous initialization lifecycle is ready.\n\n### Why it exists\n\nApplication roots and capability subtrees repeatedly need delayed Level C loading feedback, one announcement, cancellation, cleanup, restart, and error-boundary propagation around initialization. Vireo owns that lifecycle boundary so consumers do not rebuild subtly unsafe effects. Use it when descendants must not mount before a resource is ready; set `announceLoading={false}` beneath an announcing ancestor, and use an ordinary effect when rendering may proceed independently.",
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

export const Loading: Story = {
  render: () => <LoadingExample />,
  parameters: source(loadingExampleSource),
};

export const Error: Story = {
  render: () => <ErrorExample />,
  parameters: {
    ...source(errorExampleSource),
    docs: {
      ...source(errorExampleSource).docs,
      description: { story: "Lets the nearest error boundary own failure presentation and retry by remounting." },
    },
  },
};
