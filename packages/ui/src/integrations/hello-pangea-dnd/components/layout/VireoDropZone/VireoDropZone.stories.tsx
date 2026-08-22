import CustomizedSlotsExample from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/CustomizedSlotsExample.tsx?raw";
import BetweenListsExample from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/BetweenListsExample";
import betweenListsExampleSource from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/BetweenListsExample.tsx?raw";
import DefaultExample from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/DefaultExample";
import defaultExampleSource from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/DefaultExample.tsx?raw";
import DisabledStatesExample from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/DisabledStatesExample";
import disabledStatesExampleSource from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/DisabledStatesExample.tsx?raw";
import DragStateExample from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/DragStateExample";
import dragStateExampleSource from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/DragStateExample.tsx?raw";
import DropAcceptanceExample from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/DropAcceptanceExample";
import dropAcceptanceExampleSource from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/DropAcceptanceExample.tsx?raw";
import HorizontalReorderExample from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/HorizontalReorderExample";
import horizontalReorderExampleSource from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/HorizontalReorderExample.tsx?raw";
import ThemeCustomizationExample from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/ThemeCustomizationExample.tsx?raw";
import TransferTargetExample from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/TransferTargetExample";
import transferTargetExampleSource from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/storybook/TransferTargetExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoDropZone } from "./VireoDropZone";

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
  title: "Integrations/Hello Pangea DND/VireoDropZone",
  component: VireoDropZone,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoDropZone defines a typed reorder list or transfer destination inside VireoDndProvider.

### Why it exists

Applications otherwise repeat identifier serialization, group compatibility, acceptance policy, placeholder wiring, and drag-state feedback around every Hello Pangea droppable. Use it for ordinary lists; pair a virtualization-specific primitive directly with Hello Pangea when windowing is required.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoDropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { id: { type: "task-list", listId: "release" }, mode: "reorder" },
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const BetweenLists: Story = {
  args: { id: { type: "task-list", listId: "backlog" }, mode: "reorder" },
  render: () => <BetweenListsExample />,
  parameters: createSourceParameters(betweenListsExampleSource),
};

export const TransferTarget: Story = {
  args: { id: { type: "task-list", listId: "archive" }, mode: "transfer" },
  render: () => <TransferTargetExample />,
  parameters: createSourceParameters(transferTargetExampleSource),
};

export const DropAcceptance: Story = {
  args: { id: { type: "task-list", listId: "urgent" }, mode: "transfer" },
  render: () => <DropAcceptanceExample />,
  parameters: createSourceParameters(dropAcceptanceExampleSource),
};

export const HorizontalReorder: Story = {
  args: { id: { type: "toolbar", toolbarId: "primary" }, mode: "reorder" },
  render: () => <HorizontalReorderExample />,
  parameters: createSourceParameters(horizontalReorderExampleSource),
};

export const DisabledStates: Story = {
  args: { id: { type: "list", listId: "disabled" }, mode: "transfer" },
  render: () => <DisabledStatesExample />,
  parameters: createSourceParameters(disabledStatesExampleSource),
};

export const DragState: Story = {
  args: { id: { type: "list", listId: "state" }, mode: "reorder" },
  render: () => <DragStateExample />,
  parameters: createSourceParameters(dragStateExampleSource),
};

export const CustomizedSlots: Story = {
  args: { id: { type: "task-list", listId: "archive" }, mode: "transfer" },
  render: () => <CustomizedSlotsExample />,
  parameters: createSourceParameters(customizedSlotsExampleSource),
};

export const ThemeCustomization: Story = {
  args: { id: { type: "task-list", listId: "themed" }, mode: "transfer" },
  render: () => <ThemeCustomizationExample />,
  parameters: createSourceParameters(themeCustomizationExampleSource),
};
