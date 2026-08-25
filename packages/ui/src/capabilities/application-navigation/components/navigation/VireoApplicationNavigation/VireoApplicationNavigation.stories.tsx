import CustomizedSlotsExample from "@/capabilities/application-navigation/components/navigation/VireoApplicationNavigation/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/capabilities/application-navigation/components/navigation/VireoApplicationNavigation/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/application-navigation/components/navigation/VireoApplicationNavigation/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/application-navigation/components/navigation/VireoApplicationNavigation/internal/storybook/DefaultExample.tsx?raw";
import LockedModeExample from "@/capabilities/application-navigation/components/navigation/VireoApplicationNavigation/internal/storybook/LockedModeExample";
import lockedModeExampleSource from "@/capabilities/application-navigation/components/navigation/VireoApplicationNavigation/internal/storybook/LockedModeExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/application-navigation/components/navigation/VireoApplicationNavigation/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/capabilities/application-navigation/components/navigation/VireoApplicationNavigation/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoApplicationNavigation } from "./VireoApplicationNavigation";

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
  title: "TypeScript/UI/Capabilities/Application Navigation/VireoApplicationNavigation",
  component: VireoApplicationNavigation,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `Provides the responsive, resizable navigation surface used by desktop and mobile application shells.

### Why it exists

Application shells otherwise duplicate width persistence, compact-mode transitions, pointer resizing, mobile drawer behavior, and accessibility wiring. Vireo owns those mechanics while applications retain routes, branding, account controls, and persistence.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoApplicationNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null },
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const LockedMode: Story = {
  args: { children: null },
  render: () => <LockedModeExample />,
  parameters: createSourceParameters(lockedModeExampleSource),
};

export const CustomizedSlots: Story = {
  args: { children: null },
  render: () => <CustomizedSlotsExample />,
  parameters: createSourceParameters(customizedSlotsExampleSource),
};

export const ThemeCustomization: Story = {
  args: { children: null },
  render: () => <ThemeCustomizationExample />,
  parameters: createSourceParameters(themeCustomizationExampleSource),
};
