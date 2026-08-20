import type { Meta, StoryObj } from "@storybook/react-vite";
import AspectRatioPreservationExample from "@/core/components/surfaces/VireoIconContainer/internal/storybook/AspectRatioPreservationExample";
import aspectRatioPreservationExampleSource from "@/core/components/surfaces/VireoIconContainer/internal/storybook/AspectRatioPreservationExample.tsx?raw";
import DefaultExample from "@/core/components/surfaces/VireoIconContainer/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/surfaces/VireoIconContainer/internal/storybook/DefaultExample.tsx?raw";
import { VireoIconContainer } from "./VireoIconContainer";

function createSourceParameters(code: string) {
  return {
    docs: {
      source: {
        code,
        language: "tsx",
        type: "code" as const,
      },
    },
  };
}

const meta = {
  title: "Core/Surfaces/VireoIconContainer",
  component: VireoIconContainer,
  tags: ["autodocs"],
  args: {
    viewBoxWidth: 16,
    viewBoxHeight: 16,
    children: null,
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Normalizes SVG geometry from an arbitrary source coordinate system into Vireo's standard 24×24 icon canvas.\n\n### Why it exists\n\nIcon geometry frequently comes from assets with different view boxes. Repeating manual transforms produces inconsistent scale and alignment, so this component centralizes proportional scaling and centering while preserving the source aspect ratio. Use it for geometry that was not already authored in a 24×24 coordinate system.",
      },
    },
  },
  argTypes: {
    children: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoIconContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const AspectRatioPreservation: Story = {
  render: () => <AspectRatioPreservationExample />,
  parameters: createSourceParameters(aspectRatioPreservationExampleSource),
};
