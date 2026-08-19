import type { Meta, StoryObj } from "@storybook/react-vite";
import CustomizedSlotsExample from "@/core/components/surfaces/VireoIconContainer/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/surfaces/VireoIconContainer/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/surfaces/VireoIconContainer/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/surfaces/VireoIconContainer/internal/storybook/DefaultExample.tsx?raw";
import LargeSquareSourceExample from "@/core/components/surfaces/VireoIconContainer/internal/storybook/LargeSquareSourceExample";
import largeSquareSourceExampleSource from "@/core/components/surfaces/VireoIconContainer/internal/storybook/LargeSquareSourceExample.tsx?raw";
import NonSquareSourceExample from "@/core/components/surfaces/VireoIconContainer/internal/storybook/NonSquareSourceExample";
import nonSquareSourceExampleSource from "@/core/components/surfaces/VireoIconContainer/internal/storybook/NonSquareSourceExample.tsx?raw";
import PortraitSourceExample from "@/core/components/surfaces/VireoIconContainer/internal/storybook/PortraitSourceExample";
import portraitSourceExampleSource from "@/core/components/surfaces/VireoIconContainer/internal/storybook/PortraitSourceExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/surfaces/VireoIconContainer/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/surfaces/VireoIconContainer/internal/storybook/ThemeCustomizationExample.tsx?raw";
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
    docs: {
      description: {
        component:
          "Normalizes SVG geometry from an arbitrary source coordinate system into Vireo's standard 24×24 icon canvas.\n\n### Why it exists\n\nIcon geometry frequently comes from assets with different view boxes. Repeating manual transforms produces inconsistent scale and alignment, so this component centralizes proportional scaling and centering while preserving the source aspect ratio. Use it for geometry that was not already authored in a 24×24 coordinate system.",
      },
    },
  },
  argTypes: {
    viewBoxWidth: { control: { type: "number", min: 1 } },
    viewBoxHeight: { control: { type: "number", min: 1 } },
    children: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoIconContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ viewBoxHeight, viewBoxWidth }) => (
    <DefaultExample viewBoxHeight={viewBoxHeight} viewBoxWidth={viewBoxWidth} />
  ),
  parameters: createSourceParameters(defaultExampleSource),
};

export const LargeSquareSource: Story = {
  args: {
    viewBoxWidth: 32,
    viewBoxHeight: 32,
  },
  render: ({ viewBoxHeight, viewBoxWidth }) => (
    <LargeSquareSourceExample viewBoxHeight={viewBoxHeight} viewBoxWidth={viewBoxWidth} />
  ),
  parameters: createSourceParameters(largeSquareSourceExampleSource),
};

export const NonSquareSource: Story = {
  args: {
    viewBoxWidth: 32,
    viewBoxHeight: 16,
  },
  render: ({ viewBoxHeight, viewBoxWidth }) => (
    <NonSquareSourceExample viewBoxHeight={viewBoxHeight} viewBoxWidth={viewBoxWidth} />
  ),
  parameters: createSourceParameters(nonSquareSourceExampleSource),
};

export const PortraitSource: Story = {
  args: {
    viewBoxWidth: 16,
    viewBoxHeight: 32,
  },
  render: ({ viewBoxHeight, viewBoxWidth }) => (
    <PortraitSourceExample viewBoxHeight={viewBoxHeight} viewBoxWidth={viewBoxWidth} />
  ),
  parameters: createSourceParameters(portraitSourceExampleSource),
};

export const CustomizedSlots: Story = {
  render: ({ viewBoxHeight, viewBoxWidth }) => (
    <CustomizedSlotsExample viewBoxHeight={viewBoxHeight} viewBoxWidth={viewBoxWidth} />
  ),
  parameters: createSourceParameters(customizedSlotsExampleSource),
};

export const ThemeCustomization: Story = {
  render: ({ viewBoxHeight, viewBoxWidth }) => (
    <ThemeCustomizationExample viewBoxHeight={viewBoxHeight} viewBoxWidth={viewBoxWidth} />
  ),
  parameters: createSourceParameters(themeCustomizationExampleSource),
};
