import CustomizedSlotsExample from "@/core/components/controls/VireoLabeledIconButton/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/controls/VireoLabeledIconButton/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/controls/VireoLabeledIconButton/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/controls/VireoLabeledIconButton/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/controls/VireoLabeledIconButton/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/controls/VireoLabeledIconButton/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoLabeledIconButton } from "./VireoLabeledIconButton";
const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });
const meta = {
  title: "Core/Controls/VireoLabeledIconButton",
  component: VireoLabeledIconButton,
  tags: ["autodocs"],
  parameters: {
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
export const Default: Story = { render: () => <DefaultExample />, parameters: source(defaultExampleSource) };
export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: source(customizedSlotsExampleSource),
};
export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: source(themeCustomizationExampleSource),
};
