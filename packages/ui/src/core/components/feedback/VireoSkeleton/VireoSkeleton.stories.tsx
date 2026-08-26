import DefaultExample from "@/core/components/feedback/VireoSkeleton/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/feedback/VireoSkeleton/internal/storybook/DefaultExample.tsx?raw";
import GeometryPreservingTextExample from "@/core/components/feedback/VireoSkeleton/internal/storybook/GeometryPreservingTextExample";
import geometryPreservingTextExampleSource from "@/core/components/feedback/VireoSkeleton/internal/storybook/GeometryPreservingTextExample.tsx?raw";
import ShapesExample from "@/core/components/feedback/VireoSkeleton/internal/storybook/ShapesExample";
import shapesExampleSource from "@/core/components/feedback/VireoSkeleton/internal/storybook/ShapesExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoSkeleton } from "./VireoSkeleton";

function createSourceParameters(code: string) {
  return { docs: { source: { code, language: "tsx", type: "code" as const } } };
}

const meta = {
  title: "TypeScript/UI/Core/Feedback/VireoSkeleton",
  component: VireoSkeleton,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "A silent visual leaf for text, icon, and media placeholders. Prefer wrapping known content to preserve its exact typography and geometry; let a VireoLoadingRegion own timing and announcements.",
      },
    },
  },
} satisfies Meta<typeof VireoSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const GeometryPreservingText: Story = {
  args: {},
  render: () => <GeometryPreservingTextExample />,
  parameters: createSourceParameters(geometryPreservingTextExampleSource),
};

export const Shapes: Story = {
  args: {},
  render: () => <ShapesExample />,
  parameters: createSourceParameters(shapesExampleSource),
};
