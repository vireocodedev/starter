import DefaultExample from "@/capabilities/forms/components/forms/VireoFormActions/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormActions/internal/storybook/DefaultExample.tsx?raw";
import HorizontalLayoutExample from "@/capabilities/forms/components/forms/VireoFormActions/internal/storybook/HorizontalLayoutExample";
import horizontalLayoutExampleSource from "@/capabilities/forms/components/forms/VireoFormActions/internal/storybook/HorizontalLayoutExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormActions } from "./VireoFormActions";

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
  title: "TypeScript/UI/Capabilities/Forms/VireoFormActions",
  component: VireoFormActions,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormActions keeps form actions in one stable horizontal row and shares the available width equally between ordinary action buttons.

### Why it exists

Forms otherwise repeat action ordering, spacing, alignment, and narrow-surface wrapping rules in every page, dialog, and drawer. Vireo owns one predictable contract: Cancel precedes Submit, both share the row equally, and optional overflow commands use an intrinsic-width icon button. Use it for form-level actions; use an ordinary button group for unrelated commands.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  args: { children: "Form actions" },
} satisfies Meta<typeof VireoFormActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const HorizontalLayout: Story = {
  render: () => <HorizontalLayoutExample />,
  parameters: createSourceParameters(horizontalLayoutExampleSource),
};
