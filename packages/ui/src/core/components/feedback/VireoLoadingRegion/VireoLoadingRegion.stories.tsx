import DefaultExample from "@/core/components/feedback/VireoLoadingRegion/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/feedback/VireoLoadingRegion/internal/storybook/DefaultExample.tsx?raw";
import LoadingExample from "@/core/components/feedback/VireoLoadingRegion/internal/storybook/LoadingExample";
import loadingExampleSource from "@/core/components/feedback/VireoLoadingRegion/internal/storybook/LoadingExample.tsx?raw";
import LoadingTransitionExample from "@/core/components/feedback/VireoLoadingRegion/internal/storybook/LoadingTransitionExample";
import loadingTransitionExampleSource from "@/core/components/feedback/VireoLoadingRegion/internal/storybook/LoadingTransitionExample.tsx?raw";
import LoadedExample from "@/core/components/feedback/VireoLoadingRegion/internal/storybook/LoadedExample";
import loadedExampleSource from "@/core/components/feedback/VireoLoadingRegion/internal/storybook/LoadedExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoLoadingRegion } from "./VireoLoadingRegion";

function createSourceParameters(code: string) {
  return { docs: { source: { code, language: "tsx", type: "code" as const } } };
}

const meta = {
  title: "TypeScript/UI/Core/Feedback/VireoLoadingRegion",
  component: VireoLoadingRegion,
  tags: ["autodocs", "vireo-matrix"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "A stable loading boundary that owns delayed placeholder reveal, aria-busy, and one polite status announcement.\n\n### Why it exists\n\nAsynchronous surfaces otherwise duplicate timing, busy semantics, and announcements while exposing inconsistent flashes. Use VireoLoadingRegion to coordinate initial loading around geometry-preserving content; keep refreshing, empty, error, and alignment states in the composed surface.",
      },
    },
  },
} satisfies Meta<typeof VireoLoadingRegion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null, loading: false, loadingLabel: "Loading" },
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const Loaded: Story = {
  args: { children: null, loading: false, loadingLabel: "Loading" },
  render: () => <LoadedExample />,
  parameters: createSourceParameters(loadedExampleSource),
};

export const Loading: Story = {
  args: { children: null, loading: true, loadingLabel: "Loading" },
  render: () => <LoadingExample />,
  parameters: createSourceParameters(loadingExampleSource),
};

export const LoadingTransition: Story = {
  args: { children: null, loading: false, loadingLabel: "Loading" },
  render: () => <LoadingTransitionExample />,
  parameters: createSourceParameters(loadingTransitionExampleSource),
};
