import AddedAndRemovedExample from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/AddedAndRemovedExample";
import addedAndRemovedExampleSource from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/AddedAndRemovedExample.tsx?raw";
import DefaultExample from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/DefaultExample.tsx?raw";
import LongValuesExample from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/LongValuesExample";
import longValuesExampleSource from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/LongValuesExample.tsx?raw";
import NestedExpansionExample from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/NestedExpansionExample";
import nestedExpansionExampleSource from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/NestedExpansionExample.tsx?raw";
import MobileLayoutExample from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/MobileLayoutExample";
import mobileLayoutExampleSource from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/MobileLayoutExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoHistoryEntry } from "./VireoHistoryEntry";
import type { VireoHistoryEntryProps } from "./VireoHistoryEntry.types";

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

const meta: Meta<typeof VireoHistoryEntry> = {
  title: "Capabilities/History/VireoHistoryEntry",
  component: VireoHistoryEntry,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoHistoryEntry presents one typed entity change as an expandable hierarchy of added, removed, updated, moved, and unchanged values.

### Why it exists

History screens otherwise repeat diff creation, nested-group disclosure, change-state styling, long-value expansion, unchanged-field visibility, and responsive restructuring. Vireo owns that container-aware presentation contract on top of the headless starter-history engine so consumers supply definitions and snapshots instead of rebuilding a history viewer; use a custom renderer when the product needs a fundamentally different audit-log visualization.`,
      },
    },
  },
  argTypes: {
    definition: { control: false },
    previous: { control: false },
    current: { control: false },
    rootMeta: { control: false },
    emptyValue: { control: false },
    labels: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
};

export default meta;
type Story = StoryObj<Partial<VireoHistoryEntryProps>>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const AddedAndRemoved: Story = {
  render: () => <AddedAndRemovedExample />,
  parameters: createSourceParameters(addedAndRemovedExampleSource),
};

export const NestedExpansion: Story = {
  render: () => <NestedExpansionExample />,
  parameters: createSourceParameters(nestedExpansionExampleSource),
};

export const LongValues: Story = {
  render: () => <LongValuesExample />,
  parameters: createSourceParameters(longValuesExampleSource),
};

export const MobileLayout: Story = {
  render: () => <MobileLayoutExample />,
  parameters: createSourceParameters(mobileLayoutExampleSource),
};
