import AddedAndRemovedExample from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/AddedAndRemovedExample";
import addedAndRemovedExampleSource from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/AddedAndRemovedExample.tsx?raw";
import AlignmentContractExample from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/AlignmentContractExample";
import alignmentContractExampleSource from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/AlignmentContractExample.tsx?raw";
import DefaultExample from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/DefaultExample.tsx?raw";
import LoadedExample from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/LoadedExample";
import loadedExampleSource from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/LoadedExample.tsx?raw";
import LoadingExample from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/LoadingExample";
import loadingExampleSource from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/LoadingExample.tsx?raw";
import LongValuesExample from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/LongValuesExample";
import longValuesExampleSource from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/LongValuesExample.tsx?raw";
import NestedExpansionExample from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/NestedExpansionExample";
import nestedExpansionExampleSource from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/NestedExpansionExample.tsx?raw";
import MobileLayoutExample from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/MobileLayoutExample";
import mobileLayoutExampleSource from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/storybook/MobileLayoutExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
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
  title: "TypeScript/UI/Capabilities/History/VireoHistoryEntry",
  component: VireoHistoryEntry,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoHistoryEntry presents one typed entity change as an expandable hierarchy of added, removed, updated, moved, and unchanged values.

### Why it exists

History screens otherwise repeat diff creation, nested-group disclosure, change-state styling, long-value expansion, unchanged-field visibility, responsive restructuring, and initial-loading geometry. Vireo owns that container-aware presentation contract on top of the headless starter-history engine so consumers supply definitions and snapshots instead of rebuilding a history viewer. Pair its loading state with one owning VireoLoadingRegion; refreshing, empty, and error behavior remain list- or application-owned. Use a custom renderer when the product needs a fundamentally different audit-log visualization.`,
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

export const Loaded: Story = {
  render: () => <LoadedExample />,
  parameters: createSourceParameters(loadedExampleSource),
};

export const Loading: Story = {
  render: () => <LoadingExample />,
  parameters: createSourceParameters(loadingExampleSource),
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

const alignmentSelectors = [
  ".VireoHistoryEntry-root",
  ".VireoHistoryEntry-rootGroup",
  ".VireoHistoryEntry-rootHeader",
  ".VireoHistoryEntry-expandedBody",
  ".VireoHistoryEntry-fieldRow:nth-of-type(2)",
  ".VireoHistoryEntry-fieldRow:nth-of-type(3)",
] as const;

function measureAlignmentAnchors(canvasElement: HTMLElement) {
  return alignmentSelectors.map(selector => {
    const element = canvasElement.querySelector(selector);
    if (!(element instanceof HTMLElement)) throw new Error(`Missing history-entry alignment anchor: ${selector}`);
    const { height, width, x, y } = element.getBoundingClientRect();
    return { height, selector, width, x, y };
  });
}

export const AlignmentContract: Story = {
  // The browser runner exposed a nine-pixel loading-state drift. Keep the
  // regression visible until the public component can be remediated separately.
  tags: ["contract-debt"],
  render: () => <AlignmentContractExample />,
  parameters: createSourceParameters(alignmentContractExampleSource),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const loaded = measureAlignmentAnchors(canvasElement);

    await userEvent.click(canvas.getByTestId("toggle-history-entry-loading"));
    await waitFor(() => expect(canvasElement.querySelector('[data-loading-state="visible"]')).not.toBeNull());

    const loading = measureAlignmentAnchors(canvasElement);
    loading.forEach((measurement, index) => {
      const expected = loaded[index];
      expect(measurement.selector).toBe(expected.selector);
      expect(measurement.x).toBeCloseTo(expected.x, 1);
      expect(measurement.y).toBeCloseTo(expected.y, 1);
      expect(measurement.width).toBeCloseTo(expected.width, 1);
      expect(measurement.height).toBeCloseTo(expected.height, 1);
    });
  },
};
