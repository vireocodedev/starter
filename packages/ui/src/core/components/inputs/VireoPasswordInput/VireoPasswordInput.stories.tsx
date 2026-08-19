import CustomizedSlotsExample from "@/core/components/inputs/VireoPasswordInput/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/inputs/VireoPasswordInput/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/inputs/VireoPasswordInput/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/inputs/VireoPasswordInput/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/inputs/VireoPasswordInput/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/inputs/VireoPasswordInput/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoPasswordInput } from "./VireoPasswordInput";

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
  title: "Core/Inputs/VireoPasswordInput",
  component: VireoPasswordInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `Provides a controlled password field with an accessible reveal action and safe defaults.

### Why it exists

Password forms repeatedly need the same masked value behavior, current-password autocomplete, pointer-safe visibility toggle, and replaceable icons. Vireo owns that security-sensitive interaction contract. Use it for passwords and secrets users may inspect; avoid reveal affordances where policy requires values to remain masked.`,
      },
    },
  },
  args: { value: "", onChange: () => undefined },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoPasswordInput>;

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
