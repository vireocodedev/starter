import CustomRegistryIconExample from "@/core/components/data-display/VireoIcon/internal/storybook/CustomRegistryIconExample";
import customRegistryIconExampleSource from "@/core/components/data-display/VireoIcon/internal/storybook/CustomRegistryIconExample.tsx?raw";
import DecorativeWithTextExample from "@/core/components/data-display/VireoIcon/internal/storybook/DecorativeWithTextExample";
import decorativeWithTextExampleSource from "@/core/components/data-display/VireoIcon/internal/storybook/DecorativeWithTextExample.tsx?raw";
import DefaultExample from "@/core/components/data-display/VireoIcon/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/data-display/VireoIcon/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoIcon } from "./VireoIcon";

function createSourceParameters(code: string) {
  return { docs: { source: { code, language: "tsx", type: "code" as const } } };
}

const meta = {
  title: "TypeScript/UI/Core/Data Display/VireoIcon",
  component: VireoIcon,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
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

export const DecorativeWithText: Story = {
  render: () => <DecorativeWithTextExample />,
  parameters: createSourceParameters(decorativeWithTextExampleSource),
};

export const CustomRegistryIcon: Story = {
  render: () => <CustomRegistryIconExample />,
  parameters: createSourceParameters(customRegistryIconExampleSource),
};
