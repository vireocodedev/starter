import CustomizedSlotsExample from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/DefaultExample.tsx?raw";
import HorizontalOverflowExample from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/HorizontalOverflowExample";
import horizontalOverflowExampleSource from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/HorizontalOverflowExample.tsx?raw";
import InitiallyExpandedExample from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/InitiallyExpandedExample";
import initiallyExpandedExampleSource from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/InitiallyExpandedExample.tsx?raw";
import OverflowingRichContentExample from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/OverflowingRichContentExample";
import overflowingRichContentExampleSource from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/OverflowingRichContentExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { VireoTruncatedContent } from "./VireoTruncatedContent";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta: Meta<typeof VireoTruncatedContent> = {
  title: "Core/Data Display/VireoTruncatedContent",
  component: VireoTruncatedContent,
  tags: ["autodocs"],
  args: { children: null, expandLabel: "Show more", collapseLabel: "Show less" },
  parameters: {
    layout: "padded",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Collapses rendered React content when it exceeds the available height or width and exposes the complete content through an accessible disclosure control.\n\n### Why it exists\n\nDense interfaces need compact previews, but CSS truncation alone can permanently hide rich or multiline content. This component combines overflow detection, constrained presentation, and accessible expansion without requiring each consumer to rebuild that behavior. Use it when the complete content must remain available on demand; use permanent ellipsis when disclosure is unnecessary.",
      },
    },
  },
  argTypes: {
    children: { control: false },
    onExpandedChange: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <DefaultExample />, parameters: source(defaultExampleSource) };
export const OverflowingRichContent: Story = {
  args: { onExpandedChange: fn() },
  render: ({ onExpandedChange }) => <OverflowingRichContentExample onExpandedChange={onExpandedChange} />,
  parameters: source(overflowingRichContentExampleSource),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const expandToggle = await canvas.findByRole("button", { name: "Show more" });
    await userEvent.click(expandToggle);
    await expect(args.onExpandedChange).toHaveBeenLastCalledWith(true);
    await userEvent.click(canvas.getByRole("button", { name: "Show less" }));
    await expect(args.onExpandedChange).toHaveBeenLastCalledWith(false);
  },
};
export const InitiallyExpanded: Story = {
  render: () => <InitiallyExpandedExample />,
  parameters: source(initiallyExpandedExampleSource),
};
export const HorizontalOverflow: Story = {
  render: () => <HorizontalOverflowExample />,
  parameters: source(horizontalOverflowExampleSource),
};
export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: source(customizedSlotsExampleSource),
};
export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: source(themeCustomizationExampleSource),
};
