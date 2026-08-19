import CustomizedSlotsExample from "@/core/components/layout/VireoSlidingScreenStack/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/layout/VireoSlidingScreenStack/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/layout/VireoSlidingScreenStack/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/layout/VireoSlidingScreenStack/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/layout/VireoSlidingScreenStack/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/layout/VireoSlidingScreenStack/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoSlidingScreenStack } from "./VireoSlidingScreenStack";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "Core/Layout/VireoSlidingScreenStack",
  component: VireoSlidingScreenStack,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `Keeps a set of full-width screens mounted while animating controlled navigation between them.

### Why it exists

Multi-step and drill-in interfaces often need to preserve each screen's local state while moving horizontally between levels. Vireo owns the track geometry, transition, and active-screen semantics. Use it for a small controlled stack of adjacent views; use routing when screens need URLs, independent loading, or browser history.`,
      },
    },
  },
  args: { activeScreen: "overview", screens: [] },
  argTypes: {
    screens: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoSlidingScreenStack>;

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
