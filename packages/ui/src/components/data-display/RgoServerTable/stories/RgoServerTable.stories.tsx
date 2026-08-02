import { RgoServerTable } from "@/components/data-display/RgoServerTable/RgoServerTable";
import { type Employee } from "@/components/data-display/RgoServerTable/stories/RgoServerTable.stories.utils";
import {
  RgoServerTableWithDefaultPropsDemo,
  RgoServerTableWithDefaultPropsDemoCode,
} from "@/components/data-display/RgoServerTable/stories/RgoServerTableWithDefaultPropsDemo";
import {
  RgoServerTableWithExpandableRowsDemo,
  RgoServerTableWithExpandableRowsDemoCode,
} from "@/components/data-display/RgoServerTable/stories/RgoServerTableWithExpandableRowsDemo";
import {
  RgoServerTableWithHighlightingDemo,
  RgoServerTableWithHighlightingDemoCode,
} from "@/components/data-display/RgoServerTable/stories/RgoServerTableWithHighlightingDemo";
import {
  RgoServerTableWithSortingDemo,
  RgoServerTableWithSortingDemoCode,
} from "@/components/data-display/RgoServerTable/stories/RgoServerTableWithSortingDemo";
import {
  RgoServerTableWithStickyHeaderDemo,
  RgoServerTableWithStickyHeaderDemoCode,
} from "@/components/data-display/RgoServerTable/stories/RgoServerTableWithStickyHeaderDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A server-side data table component with sorting, pagination, and expandable row functionality. It provides a complete table solution with Material-UI styling for server-side data management scenarios where data fetching and sorting are handled externally.

## Stories
- [With default props](#with-default-props)
- [With expandable rows](#with-expandable-rows)
- [With sorting](#with-sorting)
- [With highlighting](#with-highlighting)
- [With sticky header](#with-sticky-header)

## Usage

\`\`\`tsx
${RgoServerTableWithDefaultPropsDemoCode}
\`\`\``;

const meta: Meta<typeof RgoServerTable> = {
  title: "Components/Data display/RgoServerTable",
  component: RgoServerTable,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    data: {
      control: false,
      description: "Array of data items to display in the table",
    },
    columns: {
      control: false,
      description: "Column configuration with header, body, and sorting components",
    },
    keyMapper: {
      control: false,
      description: "Function to extract unique key from each data item",
    },
    count: {
      control: { type: "number", min: 0, step: 1 },
      description: "Total number of items available on the server",
    },
    pagination: {
      control: false,
      description: "Current pagination state including page, rowsPerPage, sorting",
      table: {
        type: { summary: "PageableParams" },
      },
    },
    onPaginationChange: {
      control: false,
      description: "Callback function for pagination and sorting changes",
      table: {
        type: { summary: "ReactStateSetter<PageableParams>" },
      },
    },
    rowsPerPageOptions: {
      control: false,
      description: "Available options for rows per page selection",
      table: {
        type: { summary: "number[]" },
      },
    },
    highlighted: {
      control: false,
      description: "Function to determine if a row should be highlighted",
    },
    AccordionComponent: {
      control: false,
      description: "Component to render expandable row content",
      table: {
        type: { summary: "React.ComponentType" },
      },
    },
    size: {
      control: "select",
      options: ["small", "medium"],
      description: "Table size variant",
      table: { type: { summary: '"small" | "medium"' } },
    },
    className: {
      control: "text",
      description: "Additional CSS class name for the table",
    },
    stickyMaxHeight: {
      control: "text",
      description: "Maximum height for sticky header table (string or number)",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RgoServerTable<Employee>>;

export const WithDefaultProps: Story = {
  name: "With default props",
  args: {
    data: undefined,
    count: 3,
    size: "small",
    stickyMaxHeight: "",
    className: "",
    columns: undefined,
    keyMapper: undefined,
    pagination: undefined,
    onPaginationChange: undefined,
  },
  render: args => <RgoServerTableWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Basic usage of RgoServerTable with only required props and interactive pagination.",
      },
      source: {
        code: RgoServerTableWithDefaultPropsDemoCode,
      },
    },
  },
};

export const WithExpandableRows: Story = {
  name: "With expandable rows",
  render: () => <RgoServerTableWithExpandableRowsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Example with expandable rows showing additional employee details when expanded. Fully interactive with pagination and sorting.",
      },
      source: {
        code: RgoServerTableWithExpandableRowsDemoCode,
      },
    },
  },
};

export const WithSorting: Story = {
  name: "With sorting",
  render: () => <RgoServerTableWithSortingDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Example demonstrating interactive server-side sorting functionality. Click column headers to change sorting.",
      },
      source: {
        code: RgoServerTableWithSortingDemoCode,
      },
    },
  },
};

export const WithHighlighting: Story = {
  name: "With row highlighting",
  render: () => <RgoServerTableWithHighlightingDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Example showing conditional row highlighting based on data values with interactive sorting and pagination.",
      },
      source: {
        code: RgoServerTableWithHighlightingDemoCode,
      },
    },
  },
};

export const WithStickyHeader: Story = {
  name: "With sticky header",
  render: () => <RgoServerTableWithStickyHeaderDemo />,
  parameters: {
    docs: {
      description: {
        story: "Example with sticky headers that remain visible during vertical scrolling, with interactive controls.",
      },
      source: {
        code: RgoServerTableWithStickyHeaderDemoCode,
      },
    },
  },
};
