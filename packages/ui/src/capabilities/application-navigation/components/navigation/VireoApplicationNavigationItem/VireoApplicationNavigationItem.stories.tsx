import CustomizedSlotsExample from "@/capabilities/application-navigation/components/navigation/VireoApplicationNavigationItem/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/capabilities/application-navigation/components/navigation/VireoApplicationNavigationItem/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/application-navigation/components/navigation/VireoApplicationNavigationItem/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/application-navigation/components/navigation/VireoApplicationNavigationItem/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/application-navigation/components/navigation/VireoApplicationNavigationItem/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/capabilities/application-navigation/components/navigation/VireoApplicationNavigationItem/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoApplicationNavigationItem } from "./VireoApplicationNavigationItem";

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
  title: "TypeScript/UI/Capabilities/Application Navigation/VireoApplicationNavigationItem",
  component: VireoApplicationNavigationItem,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `Renders one application destination with coordinated expanded and compact navigation presentations.

### Why it exists

Application navigation items otherwise repeat mode-aware direction, icon alignment, captions, selection styling, compact tooltips, and destination-link semantics. Use it inside VireoApplicationNavigation; use ordinary buttons for actions that are not destinations.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoApplicationNavigationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { href: "#navigation-item", icon: null, label: "Navigation item" },
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const CustomizedSlots: Story = {
  args: { href: "#navigation-item", icon: null, label: "Navigation item" },
  render: () => <CustomizedSlotsExample />,
  parameters: createSourceParameters(customizedSlotsExampleSource),
};

export const ThemeCustomization: Story = {
  args: { href: "#navigation-item", icon: null, label: "Navigation item" },
  render: () => <ThemeCustomizationExample />,
  parameters: createSourceParameters(themeCustomizationExampleSource),
};
