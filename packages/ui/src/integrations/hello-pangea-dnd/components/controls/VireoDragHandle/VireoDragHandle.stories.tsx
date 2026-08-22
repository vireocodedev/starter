import CustomizedSlotsExample from "@/integrations/hello-pangea-dnd/components/controls/VireoDragHandle/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/integrations/hello-pangea-dnd/components/controls/VireoDragHandle/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/integrations/hello-pangea-dnd/components/controls/VireoDragHandle/internal/storybook/DefaultExample";
import defaultExampleSource from "@/integrations/hello-pangea-dnd/components/controls/VireoDragHandle/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/integrations/hello-pangea-dnd/components/controls/VireoDragHandle/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/integrations/hello-pangea-dnd/components/controls/VireoDragHandle/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoDragHandle } from "./VireoDragHandle";

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
  title: "Integrations/Hello Pangea DND/VireoDragHandle",
  component: VireoDragHandle,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoDragHandle renders the accessible, dedicated grip for an explicit-handle VireoDraggableItem.

### Why it exists

Rows containing links, buttons, or editable controls need a predictable drag target that does not compete with those interactions. VireoDragHandle owns the native handle wiring, required accessible name, disabled state, icon slot, and grab cursor.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoDragHandle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { "aria-label": "Move item" },
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const CustomizedSlots: Story = {
  args: { "aria-label": "Move item" },
  render: () => <CustomizedSlotsExample />,
  parameters: createSourceParameters(customizedSlotsExampleSource),
};

export const ThemeCustomization: Story = {
  args: { "aria-label": "Move item" },
  render: () => <ThemeCustomizationExample />,
  parameters: createSourceParameters(themeCustomizationExampleSource),
};
