import { RgoClientTable } from "@/components/data-display/RgoClientTable/RgoClientTable";
import type { User } from "@/components/data-display/RgoClientTable/stories/RgoClientTable.stories.utils";
import {
  RgoClientTableWithDefaultPropsDemo,
  RgoClientTableWithDefaultPropsDemoCode,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTableWithDefaultPropsDemo";
import {
  RgoClientTableWithExpandableRowsDemo,
  RgoClientTableWithExpandableRowsDemoCode,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTableWithExpandableRowsDemo";
import {
  RgoClientTableWithPaginationDemo,
  RgoClientTableWithPaginationDemoCode,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTableWithPaginationDemo";
import {
  RgoClientTableWithRowHighlightingDemo,
  RgoClientTableWithRowHighlightingDemoCode,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTableWithRowHighlightingDemo";
import {
  RgoClientTableWithSmallSizeDemo,
  RgoClientTableWithSmallSizeDemoCode,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTableWithSmallSizeDemo";
import {
  RgoClientTableWithSortingDemo,
  RgoClientTableWithSortingDemoCode,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTableWithSortingDemo";
import {
  RgoClientTableWithStickyHeaderDemo,
  RgoClientTableWithStickyHeaderDemoCode,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTableWithStickyHeaderDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A client-side data table component with sorting, pagination, and expandable row functionality. It provides a complete table solution with Material-UI styling and customizable column configurations.

## Stories
- [With default props](#with-default-props)
- [With pagination](#with-pagination)
- [With sorting](#with-sorting)
- [With expandable rows](#with-expandable-rows)
- [With row highlighting](#with-row-highlighting)
- [With sticky header](#with-sticky-header)
- [With small size](#with-small-size)

## Usage

\`\`\`tsx
${RgoClientTableWithDefaultPropsDemoCode}
\`\`\``;

const meta: Meta<typeof RgoClientTable> = {
  title: "Components/Data display/RgoClientTable",
  component: RgoClientTable,
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
      table: { type: { summary: '"small" | "medium"' }, defaultValue: { summary: '"medium"' } },
    },
    className: {
      control: "text",
      description: "Additional CSS class name for the table",
    },
    stickyMaxHeight: {
      control: "text",
      description: "Maximum height for sticky header table (string or number)",
      table: {
        type: { summary: "string | number" },
      },
    },
    disablePagination: {
      control: "boolean",
      description: "Whether to disable pagination functionality",
    },
    pagination: {
      control: false,
      description: "Pagination configuration object",
      table: {
        type: { summary: "PageableParams" },
      },
    },
    onPaginationChange: {
      control: false,
      description: "Callback function for pagination changes",
      table: {
        type: { summary: "(pagination: PageableParams) => void" },
      },
    },
    rowsPerPageOptions: {
      control: "object",
      description: "Available options for rows per page",
      table: {
        type: { summary: "number[]" },
        defaultValue: { summary: "[10, 20, 50]" },
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RgoClientTable<User>>;

export const WithDefaultProps: Story = {
  name: "With default props",
  args: {
    size: "medium",
    disablePagination: false,
    rowsPerPageOptions: [10, 20, 50],
    className: "",
    stickyMaxHeight: undefined,
  },
  render: args => <RgoClientTableWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Basic usage of RgoClientTable with only required props (data and columns).",
      },
      source: {
        code: RgoClientTableWithDefaultPropsDemoCode,
      },
    },
  },
};

export const WithPagination: Story = {
  name: "With pagination",
  render: () => <RgoClientTableWithPaginationDemo />,
  parameters: {
    docs: {
      description: {
        story: "RgoClientTable with pagination enabled showing 3 rows per page.",
      },
      source: {
        code: RgoClientTableWithPaginationDemoCode,
      },
    },
  },
};

export const WithSorting: Story = {
  name: "With sorting",
  render: () => <RgoClientTableWithSortingDemo />,
  parameters: {
    docs: {
      description: {
        story: "RgoClientTable with sortable columns. Click column headers to sort.",
      },
      source: {
        code: RgoClientTableWithSortingDemoCode,
      },
    },
  },
};

export const WithExpandableRows: Story = {
  name: "With expandable rows",
  render: () => <RgoClientTableWithExpandableRowsDemo />,
  parameters: {
    docs: {
      description: {
        story: "RgoClientTable with expandable rows showing additional details when expanded.",
      },
      source: {
        code: RgoClientTableWithExpandableRowsDemoCode,
      },
    },
  },
};

export const WithRowHighlighting: Story = {
  name: "With row highlighting",
  render: () => <RgoClientTableWithRowHighlightingDemo />,
  parameters: {
    docs: {
      description: {
        story: "RgoClientTable with conditional row highlighting for active users.",
      },
      source: {
        code: RgoClientTableWithRowHighlightingDemoCode,
      },
    },
  },
};

export const WithStickyHeader: Story = {
  name: "With sticky header",
  render: () => <RgoClientTableWithStickyHeaderDemo />,
  parameters: {
    docs: {
      description: {
        story: "RgoClientTable with sticky header and fixed maximum height for scrolling.",
      },
      source: {
        code: RgoClientTableWithStickyHeaderDemoCode,
      },
    },
  },
};

export const WithSmallSize: Story = {
  name: "With small size",
  render: () => <RgoClientTableWithSmallSizeDemo />,
  parameters: {
    docs: {
      description: {
        story: "RgoClientTable with small size variant for more compact display.",
      },
      source: {
        code: RgoClientTableWithSmallSizeDemoCode,
      },
    },
  },
};
