import ConstrainedHeightExample from "@/core/components/data-display/VireoJsonViewer/internal/storybook/ConstrainedHeightExample";
import constrainedHeightExampleSource from "@/core/components/data-display/VireoJsonViewer/internal/storybook/ConstrainedHeightExample.tsx?raw";
import CopyInteractionExample from "@/core/components/data-display/VireoJsonViewer/internal/storybook/CopyInteractionExample";
import copyInteractionExampleSource from "@/core/components/data-display/VireoJsonViewer/internal/storybook/CopyInteractionExample.tsx?raw";
import CustomizedSlotsExample from "@/core/components/data-display/VireoJsonViewer/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/data-display/VireoJsonViewer/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/data-display/VireoJsonViewer/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/data-display/VireoJsonViewer/internal/storybook/DefaultExample.tsx?raw";
import NonJsonValuesExample from "@/core/components/data-display/VireoJsonViewer/internal/storybook/NonJsonValuesExample";
import nonJsonValuesExampleSource from "@/core/components/data-display/VireoJsonViewer/internal/storybook/NonJsonValuesExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/data-display/VireoJsonViewer/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/data-display/VireoJsonViewer/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { VireoJsonViewer } from "./VireoJsonViewer";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "Core/Data Display/VireoJsonViewer",
  component: VireoJsonViewer,
  tags: ["autodocs"],
  args: { data: null, copyLabel: "Copy JSON to clipboard", copiedLabel: "JSON copied" },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoJsonViewer presents arbitrary structured values as readable, copyable JSON.

### Why it exists

Diagnostic payloads, configuration snapshots, and API responses recur across Vireo consumers. This component gives them one resilient representation that safely handles non-JSON values, constrains long output, and provides accessible copy feedback without coupling inspection to a particular dialog or page layout.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoJsonViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <DefaultExample />, parameters: source(defaultExampleSource) };
export const ConstrainedHeight: Story = {
  render: () => <ConstrainedHeightExample />,
  parameters: {
    ...source(constrainedHeightExampleSource),
    docs: {
      ...source(constrainedHeightExampleSource).docs,
      description: { story: "A bounded region keeps large payloads scrollable without taking over the layout." },
    },
  },
};
export const NonJsonValues: Story = {
  render: () => <NonJsonValuesExample />,
  parameters: source(nonJsonValuesExampleSource),
};
export const CopyInteraction: Story = {
  render: () => <CopyInteractionExample />,
  parameters: source(copyInteractionExampleSource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Copy JSON to clipboard" }));
    await expect(canvas.getByRole("button", { name: "JSON copied" })).toBeInTheDocument();
  },
};
export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: source(customizedSlotsExampleSource),
};
export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: source(themeCustomizationExampleSource),
};
