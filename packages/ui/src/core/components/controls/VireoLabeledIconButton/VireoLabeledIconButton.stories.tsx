import DefaultExample from "@/core/components/controls/VireoLabeledIconButton/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/controls/VireoLabeledIconButton/internal/storybook/DefaultExample.tsx?raw";
import LongLabelExample from "@/core/components/controls/VireoLabeledIconButton/internal/storybook/LongLabelExample";
import longLabelExampleSource from "@/core/components/controls/VireoLabeledIconButton/internal/storybook/LongLabelExample.tsx?raw";
import SelectionAndStatusStatesExample from "@/core/components/controls/VireoLabeledIconButton/internal/storybook/SelectionAndStatusStatesExample";
import selectionAndStatusStatesExampleSource from "@/core/components/controls/VireoLabeledIconButton/internal/storybook/SelectionAndStatusStatesExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { VireoLabeledIconButton } from "./VireoLabeledIconButton";
const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });
const meta = {
  title: "Core/Controls/VireoLabeledIconButton",
  component: VireoLabeledIconButton,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `Renders a compact icon-over-label action with selected and status states.

### Why it exists

Navigation and compact toolbars repeatedly need a larger labelled target than a conventional icon-only button, with consistent visual stacking and state treatment. Vireo owns that anatomy and accessibility contract. Use it when both icon and persistent label matter; use MUI IconButton when an accessible tooltip or label is sufficient.`,
      },
    },
  },
  args: { label: "Dashboard" },
  argTypes: {
    icon: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoLabeledIconButton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { onClick: fn() },
  render: ({ onClick }) => <DefaultExample onClick={onClick} />,
  parameters: source(defaultExampleSource),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Approvals" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
export const SelectionAndStatusStates: Story = {
  render: () => <SelectionAndStatusStatesExample />,
  parameters: source(selectionAndStatusStatesExampleSource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Dashboard" })).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("button", { name: "Archived" })).toBeDisabled();
  },
};
export const LongLabel: Story = {
  render: () => <LongLabelExample />,
  parameters: source(longLabelExampleSource),
};
