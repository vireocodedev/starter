import AccessibleLabelExample from "@/core/components/feedback/VireoStatusDot/internal/storybook/AccessibleLabelExample";
import accessibleLabelExampleSource from "@/core/components/feedback/VireoStatusDot/internal/storybook/AccessibleLabelExample.tsx?raw";
import CustomizedSlotsExample from "@/core/components/feedback/VireoStatusDot/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/feedback/VireoStatusDot/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/feedback/VireoStatusDot/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/feedback/VireoStatusDot/internal/storybook/DefaultExample.tsx?raw";
import InvertedExample from "@/core/components/feedback/VireoStatusDot/internal/storybook/InvertedExample";
import invertedExampleSource from "@/core/components/feedback/VireoStatusDot/internal/storybook/InvertedExample.tsx?raw";
import SemanticColorsExample from "@/core/components/feedback/VireoStatusDot/internal/storybook/SemanticColorsExample";
import semanticColorsExampleSource from "@/core/components/feedback/VireoStatusDot/internal/storybook/SemanticColorsExample.tsx?raw";
import SizesExample from "@/core/components/feedback/VireoStatusDot/internal/storybook/SizesExample";
import sizesExampleSource from "@/core/components/feedback/VireoStatusDot/internal/storybook/SizesExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/feedback/VireoStatusDot/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/feedback/VireoStatusDot/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoStatusDot } from "./VireoStatusDot";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "Core/Feedback/VireoStatusDot",
  component: VireoStatusDot,
  tags: ["autodocs"],
  args: { color: "success" },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoStatusDot displays a compact, theme-aware semantic status marker.

### Why it exists

Statuses recur in dense tables, lists, chips, and summaries where a full badge would add unnecessary visual weight. This component standardizes their colors, sizing, selected-surface contrast, and accessible standalone labelling. Use adjacent text to convey meaning whenever space allows; color alone should not carry essential information.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoStatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <DefaultExample />, parameters: source(defaultExampleSource) };
export const SemanticColors: Story = {
  render: () => <SemanticColorsExample />,
  parameters: source(semanticColorsExampleSource),
};
export const Inverted: Story = { render: () => <InvertedExample />, parameters: source(invertedExampleSource) };
export const Sizes: Story = { render: () => <SizesExample />, parameters: source(sizesExampleSource) };
export const AccessibleLabel: Story = {
  render: () => <AccessibleLabelExample />,
  parameters: source(accessibleLabelExampleSource),
};
export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: source(customizedSlotsExampleSource),
};
export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: source(themeCustomizationExampleSource),
};
