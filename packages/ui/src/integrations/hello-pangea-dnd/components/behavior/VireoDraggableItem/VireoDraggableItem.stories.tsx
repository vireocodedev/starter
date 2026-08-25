import CustomizedSlotsExample from "@/integrations/hello-pangea-dnd/components/behavior/VireoDraggableItem/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/integrations/hello-pangea-dnd/components/behavior/VireoDraggableItem/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/integrations/hello-pangea-dnd/components/behavior/VireoDraggableItem/internal/storybook/DefaultExample";
import defaultExampleSource from "@/integrations/hello-pangea-dnd/components/behavior/VireoDraggableItem/internal/storybook/DefaultExample.tsx?raw";
import InteractiveDescendantsExample from "@/integrations/hello-pangea-dnd/components/behavior/VireoDraggableItem/internal/storybook/InteractiveDescendantsExample";
import interactiveDescendantsExampleSource from "@/integrations/hello-pangea-dnd/components/behavior/VireoDraggableItem/internal/storybook/InteractiveDescendantsExample.tsx?raw";
import ThemeCustomizationExample from "@/integrations/hello-pangea-dnd/components/behavior/VireoDraggableItem/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/integrations/hello-pangea-dnd/components/behavior/VireoDraggableItem/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoDraggableItem } from "./VireoDraggableItem";

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
  title: "TypeScript/UI/Integrations/Drag and Drop · Hello Pangea DND/VireoDraggableItem",
  component: VireoDraggableItem,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoDraggableItem binds a typed application identifier and stable list index to one draggable root.

### Why it exists

Hello Pangea draggables otherwise expose native wiring, identifier encoding, interactive-child policy, force-press behavior, and visual state at every call site. Use the root as the handle for simple rows or opt into VireoDragHandle when the row contains other actions.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoDraggableItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { id: { type: "task", taskId: "review" }, index: 0 },
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const InteractiveDescendants: Story = {
  args: { id: { type: "task", taskId: "editable" }, index: 0 },
  render: () => <InteractiveDescendantsExample />,
  parameters: createSourceParameters(interactiveDescendantsExampleSource),
};

export const CustomizedSlots: Story = {
  args: { id: { type: "task", taskId: "release" }, index: 0 },
  render: () => <CustomizedSlotsExample />,
  parameters: createSourceParameters(customizedSlotsExampleSource),
};

export const ThemeCustomization: Story = {
  args: { id: { type: "task", taskId: "theme" }, index: 0 },
  render: () => <ThemeCustomizationExample />,
  parameters: createSourceParameters(themeCustomizationExampleSource),
};
