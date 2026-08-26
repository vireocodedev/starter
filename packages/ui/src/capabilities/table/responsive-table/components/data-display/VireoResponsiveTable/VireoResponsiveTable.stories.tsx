import CustomizedSlotsExample from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/DefaultExample.tsx?raw";
import AlignmentContractExample from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/AlignmentContractExample";
import alignmentContractExampleSource from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/AlignmentContractExample.tsx?raw";
import EmptyExample from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/EmptyExample";
import emptyExampleSource from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/EmptyExample.tsx?raw";
import LoadingExample from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/LoadingExample";
import loadingExampleSource from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/LoadingExample.tsx?raw";
import MobileWorkflowExample from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/MobileWorkflowExample";
import mobileWorkflowExampleSource from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/MobileWorkflowExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { VireoResponsiveTable } from "./VireoResponsiveTable";

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
  title: "TypeScript/UI/Capabilities/Tables/VireoResponsiveTable",
  component: VireoResponsiveTable,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoResponsiveTable presents one typed data model as a container-aware desktop table or mobile accordion workflow.

### Why it exists

Responsive data-heavy screens otherwise duplicate breakpoint selection, sticky-column geometry, sorting and pagination wiring, mobile disclosure rows, filters, incremental loading, loading states, and scroll restoration. Vireo owns that coordination while consumers retain typed columns, rendered cells, server state, labels, and filters. Use it when the same records genuinely need both dense desktop and compact mobile presentation; use an ordinary MUI table when only one fixed layout is required.

The skeleton state is only for initial loading without usable rows. Refreshing and error-with-stale-content remain application-owned so established records stay visible; therefore separate Refreshing and Error stories are intentionally omitted.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  args: {
    columns: [],
    data: [],
    filters: { page: 0, rowsPerPage: 10, sortBy: "", sortDirection: "asc" },
    onFiltersChange: () => undefined,
    labels: {
      table: "Table",
      loadingTable: "Loading table",
      noData: "No data",
      showMore: "Show more",
      showLess: "Show less",
      rowsPerPage: "Rows per page",
      paginationMoreThan: (from, to) => `${from}–${to} of more than ${to}`,
      paginationRange: (from, to, count) => `${from}–${to} of ${count}`,
      paginationItem: type => `Go to ${type} page`,
      filters: "Filters",
      clearFilters: "Clear",
      filtersDone: "Done",
      sortBy: "Sort by",
      sortDirection: "Sort direction",
      ascending: "Ascending",
      descending: "Descending",
      ascendingSortDirection: "Sort ascending",
      descendingSortDirection: "Sort descending",
    },
    layers: { stickyToolbar: 4, stickyRowHeader: 3 },
  },
} satisfies Meta<typeof VireoResponsiveTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const Loaded: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const MobileWorkflow: Story = {
  render: () => <MobileWorkflowExample />,
  parameters: createSourceParameters(mobileWorkflowExampleSource),
};

export const Loading: Story = {
  render: () => <LoadingExample />,
  parameters: createSourceParameters(loadingExampleSource),
};

export const Empty: Story = {
  render: () => <EmptyExample />,
  parameters: createSourceParameters(emptyExampleSource),
};

export const AlignmentContract: Story = {
  render: () => <AlignmentContractExample />,
  parameters: createSourceParameters(alignmentContractExampleSource),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelectorAll('[role="status"]')).toHaveLength(2));

    for (const pair of canvasElement.querySelectorAll<HTMLElement>("[data-alignment-pair]")) {
      const loaded = pair.querySelector<HTMLElement>('[data-alignment-state="loaded"]')!;
      const loading = pair.querySelector<HTMLElement>('[data-alignment-state="loading"]')!;
      const loadedRoot = loaded.querySelector<HTMLElement>(".VireoResponsiveTable-root")!;
      const loadingRoot = loading.querySelector<HTMLElement>(".VireoResponsiveTable-root")!;
      const mobile = pair.dataset.alignmentPair === "mobile";
      const loadedRow = loaded.querySelector<HTMLElement>(mobile ? "[data-responsive-table-mobile-row]" : "tbody tr")!;
      const loadingRow = loading.querySelector<HTMLElement>(
        mobile ? "[data-responsive-table-mobile-skeleton-row]" : "tbody tr",
      )!;

      await expect(
        Math.abs(loadedRoot.getBoundingClientRect().width - loadingRoot.getBoundingClientRect().width),
      ).toBeLessThanOrEqual(1);
      await expect(
        Math.abs(loadedRoot.getBoundingClientRect().height - loadingRoot.getBoundingClientRect().height),
      ).toBeLessThanOrEqual(1);
      await expect(
        Math.abs(loadedRow.getBoundingClientRect().height - loadingRow.getBoundingClientRect().height),
      ).toBeLessThanOrEqual(4);
    }
  },
};

export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: createSourceParameters(customizedSlotsExampleSource),
};

export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: createSourceParameters(themeCustomizationExampleSource),
};
