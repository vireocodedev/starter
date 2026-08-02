import { RgoTableCellSortable } from "@/components/data-display/RgoTable/components/RgoTableCellSortable/RgoTableCellSortable";
import {
  RgoTableCellSortableWithAlignmentsDemo,
  RgoTableCellSortableWithAlignmentsDemoCode,
} from "@/components/data-display/RgoTable/components/RgoTableCellSortable/stories/RgoTableCellSortableWithAlignmentsDemo";
import {
  RgoTableCellSortableWithHeaderComponentDemo,
  RgoTableCellSortableWithHeaderComponentDemoCode,
} from "@/components/data-display/RgoTable/components/RgoTableCellSortable/stories/RgoTableCellSortableWithHeaderComponentDemo";
import { Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  RgoTableCellSortableWithDefaultsDemo,
  RgoTableCellSortableWithDefaultsDemoCode,
} from "./RgoTableCellSortableWithDefaultsDemo";
import {
  RgoTableCellWithMultiColumnSortDemo,
  RgoTableCellWithMultiColumnSortDemoCode,
} from "./RgoTableCellWithMultiColumnSortDemo";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A table cell that provides sorting functionality. It includes a sortable header with customizable alignment, priority indicators, and hover states.

## Stories

- [With default props](#with-default-props)
- [With different alignments](#with-different-alignments)
- [With multi-column sort](#with-multi-column-sort)
- [With custom header component](#with-custom-header-component)

## Usage

\`\`\`tsx
${RgoTableCellSortableWithDefaultsDemoCode}
\`\`\``;

const meta: Meta<typeof RgoTableCellSortable> = {
  title: "Internal/RgoTableCellSortable",
  component: RgoTableCellSortable,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    id: {
      control: "text",
      description: "Unique identifier for the sortable column",
    },
    HeaderComponent: {
      control: false,
      description: "React component to render as the column header",
      table: {
        type: { summary: "React.ComponentType" },
      },
    },
    direction: {
      control: "select",
      options: ["asc", "desc"],
      description: "Sort direction for the column",
      table: {
        type: { summary: "asc | desc" },
      },
    },
    active: {
      control: false,
      description: "Whether this column is currently being sorted",
    },
    onClick: {
      control: false,
      description: "Callback function called when the sort label is clicked",
      table: {
        type: { summary: "(id: string) => void" },
      },
    },
    align: {
      control: "select",
      options: ["left", "center", "right"],
      description: "Text alignment for the column header",
      table: {
        type: { summary: "left | center | right" },
      },
    },
    priority: {
      control: "number",
      description: "Sort priority number displayed in the sort label",
    },
    widthPctShare: {
      control: "number",
      description: "Percentage of total table width that this column should take",
    },
    widthPxMin: {
      control: "number",
      description: "Minimum width in pixels for this column",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaults: Story = {
  name: "With default props",
  args: {
    id: "name",
    align: "left",
    priority: undefined,
    direction: "asc",
    active: false,
    widthPctShare: 100,
    widthPxMin: 150,
    onClick: (id: string) => console.log(`Clicked sort for column: ${id}`),
    HeaderComponent: () => (
      <Typography variant="body2" fontWeight={600}>
        Name
      </Typography>
    ),
  },
  render: args => <RgoTableCellSortableWithDefaultsDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Sortable table cell with default configuration.",
      },
      source: {
        code: RgoTableCellSortableWithDefaultsDemoCode,
      },
    },
  },
};

export const WithDifferentAlignments: Story = {
  name: "With different alignments",
  argTypes: {
    id: { control: false },
    HeaderComponent: { control: false },
    direction: { control: false },
    active: { control: false },
    onClick: { control: false },
  },
  render: () => <RgoTableCellSortableWithAlignmentsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Sortable table cells with different text alignments (left, center, right).",
      },
      source: {
        code: RgoTableCellSortableWithAlignmentsDemoCode,
      },
    },
  },
};

export const WithMultiColumnSort: Story = {
  name: "With multi-column sort",
  render: () => <RgoTableCellWithMultiColumnSortDemo />,
  parameters: {
    docs: {
      description: {
        story: "Sortable table cells with multi-column sort support.",
      },
      source: {
        code: RgoTableCellWithMultiColumnSortDemoCode,
      },
    },
  },
};

export const WithHeaderComponent: Story = {
  name: "With custom header component",
  render: () => <RgoTableCellSortableWithHeaderComponentDemo />,
  parameters: {
    docs: {
      description: {
        story: "Sortable table cell with a custom header component.",
      },
      source: {
        code: RgoTableCellSortableWithHeaderComponentDemoCode,
      },
    },
  },
};
