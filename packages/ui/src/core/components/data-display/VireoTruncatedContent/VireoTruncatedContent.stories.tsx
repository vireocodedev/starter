import ClickableRecordRowExample from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/ClickableRecordRowExample";
import clickableRecordRowExampleSource from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/ClickableRecordRowExample.tsx?raw";
import ControlledExpansionExample from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/ControlledExpansionExample";
import controlledExpansionExampleSource from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/ControlledExpansionExample.tsx?raw";
import DefaultExample from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/DefaultExample.tsx?raw";
import FitsWithoutTruncationExample from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/FitsWithoutTruncationExample";
import fitsWithoutTruncationExampleSource from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/FitsWithoutTruncationExample.tsx?raw";
import HorizontalOverflowExample from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/HorizontalOverflowExample";
import horizontalOverflowExampleSource from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/HorizontalOverflowExample.tsx?raw";
import ResponsiveOverflowExample from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/ResponsiveOverflowExample";
import responsiveOverflowExampleSource from "@/core/components/data-display/VireoTruncatedContent/internal/storybook/ResponsiveOverflowExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { VireoTruncatedContent } from "./VireoTruncatedContent";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta: Meta<typeof VireoTruncatedContent> = {
  title: "UI/Core/Data Display/VireoTruncatedContent",
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

export const Default: Story = {
  args: { onExpandedChange: fn() },
  render: ({ onExpandedChange }) => <DefaultExample onExpandedChange={onExpandedChange} />,
  parameters: source(defaultExampleSource),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const expandToggle = await canvas.findByRole("button", { name: "Show more" });
    await userEvent.click(expandToggle);
    await expect(args.onExpandedChange).toHaveBeenLastCalledWith(true);
    await userEvent.click(canvas.getByRole("button", { name: "Show less" }));
    await expect(args.onExpandedChange).toHaveBeenLastCalledWith(false);
  },
};
export const FitsWithoutTruncation: Story = {
  render: () => <FitsWithoutTruncationExample />,
  parameters: source(fitsWithoutTruncationExampleSource),
};
export const HorizontalOverflow: Story = {
  render: () => <HorizontalOverflowExample />,
  parameters: source(horizontalOverflowExampleSource),
};
export const ResponsiveOverflow: Story = {
  render: () => <ResponsiveOverflowExample />,
  parameters: source(responsiveOverflowExampleSource),
};
export const ControlledExpansion: Story = {
  render: () => <ControlledExpansionExample />,
  parameters: source(controlledExpansionExampleSource),
};
export const ClickableRecordRow: Story = {
  render: () => <ClickableRecordRowExample />,
  parameters: source(clickableRecordRowExampleSource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Show full note" }));
    await expect(canvas.getByText("Row activations: 0")).toBeVisible();

    await userEvent.click(canvas.getByRole("row", { name: /quarterly account review/i }));
    await expect(canvas.getByText("Row activations: 1")).toBeVisible();
  },
};
