import CustomizedSlotsExample from "@/core/components/data-display/VireoIcon/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/data-display/VireoIcon/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/data-display/VireoIcon/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/data-display/VireoIcon/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/data-display/VireoIcon/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/data-display/VireoIcon/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoIcon } from "./VireoIcon";

function createSourceParameters(code: string) {
  return { docs: { source: { code, language: "tsx", type: "code" as const } } };
}

const meta = {
  title: "Core/Data Display/VireoIcon",
  component: VireoIcon,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `Renders a type-safe icon selected from Vireo's application icon registry.

### Why it exists

Applications repeatedly need one typed name-to-icon boundary with consistent SVG defaults and theme customization. Vireo owns that registry contract so shared UI can request icons without importing application assets directly. Use it for registry-backed icons; use MUI SvgIcon directly for isolated geometry that does not need a shared name.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  args: { icon: "check-circle" },
} satisfies Meta<typeof VireoIcon>;

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
