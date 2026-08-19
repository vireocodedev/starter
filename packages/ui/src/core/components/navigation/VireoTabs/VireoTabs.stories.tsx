import CustomizedSlotsExample from "@/core/components/navigation/VireoTabs/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/navigation/VireoTabs/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/navigation/VireoTabs/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/navigation/VireoTabs/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/navigation/VireoTabs/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/navigation/VireoTabs/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoTabs } from "./VireoTabs";

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
  title: "Core/Navigation/VireoTabs",
  component: VireoTabs,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `Presents a labelled set of mutually exclusive content panels with accessible keyboard navigation.

### Why it exists

Settings and detail surfaces repeatedly need the same tab-to-panel relationships, selection state, keyboard behavior, and theme hooks. Vireo owns that complete navigation contract. Use it for a small set of peer views in one context; use links or routes when each destination needs its own URL or navigation history.`,
      },
    },
  },
  args: { tabs: [] },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: createSourceParameters(customizedSlotsExampleSource),
};

export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: createSourceParameters(themeCustomizationExampleSource),
};
