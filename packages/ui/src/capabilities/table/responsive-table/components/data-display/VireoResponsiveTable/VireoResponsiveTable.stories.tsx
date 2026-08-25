import CustomizedSlotsExample from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/DefaultExample.tsx?raw";
import LoadingAndEmptyExample from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/LoadingAndEmptyExample";
import loadingAndEmptyExampleSource from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/LoadingAndEmptyExample.tsx?raw";
import MobileWorkflowExample from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/MobileWorkflowExample";
import mobileWorkflowExampleSource from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/MobileWorkflowExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
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

Responsive data-heavy screens otherwise duplicate breakpoint selection, sticky-column geometry, sorting and pagination wiring, mobile disclosure rows, filters, incremental loading, loading states, and scroll restoration. Vireo owns that coordination while consumers retain typed columns, rendered cells, server state, labels, and filters. Use it when the same records genuinely need both dense desktop and compact mobile presentation; use an ordinary MUI table when only one fixed layout is required.`,
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

export const MobileWorkflow: Story = {
  render: () => <MobileWorkflowExample />,
  parameters: createSourceParameters(mobileWorkflowExampleSource),
};

export const LoadingAndEmpty: Story = {
  render: () => <LoadingAndEmptyExample />,
  parameters: createSourceParameters(loadingAndEmptyExampleSource),
};

export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: createSourceParameters(customizedSlotsExampleSource),
};

export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: createSourceParameters(themeCustomizationExampleSource),
};
