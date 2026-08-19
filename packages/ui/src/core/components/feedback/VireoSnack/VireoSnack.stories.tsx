import CustomizedSlotsExample from "@/core/components/feedback/VireoSnack/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/feedback/VireoSnack/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/feedback/VireoSnack/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/feedback/VireoSnack/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/feedback/VireoSnack/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/feedback/VireoSnack/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoSnack } from "./VireoSnack";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "Core/Feedback/VireoSnack",
  component: VireoSnack,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `Presents a compact semantic notification message with optional leading and trailing actions.

### Why it exists

Notifications repeatedly need the same semantic urgency, palette treatment, spacing, and adornment anatomy. Vireo owns that content surface so delivery systems can remain interchangeable. Use it inside toast or inline-feedback workflows; use Alert when the message belongs persistently in page content.`,
      },
    },
  },
  args: { message: "Changes saved" },
  argTypes: {
    message: { control: "text" },
    startAdornment: { control: false },
    endAdornment: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoSnack>;

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
