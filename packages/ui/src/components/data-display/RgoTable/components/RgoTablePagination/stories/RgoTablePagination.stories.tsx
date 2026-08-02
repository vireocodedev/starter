import { RgoTablePagination } from "@/components/data-display/RgoTable/components/RgoTablePagination/RgoTablePagination";
import {
  RgoTablePaginationWithDefaultsDemo,
  RgoTablePaginationWithDefaultsDemoCode,
} from "@/components/data-display/RgoTable/components/RgoTablePagination/stories/RgoTablePaginationWithDefaultsDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A pagination control component for tables that allows users to navigate through pages of data. It wraps Material-UI's \`TablePagination\` component with custom styling and internationalization support.

## Stories

- [With default props](#anchor--internal-rgotablepagination--with-default-props)

## Usage

\`\`\`tsx
${RgoTablePaginationWithDefaultsDemoCode}
\`\`\``;

const meta: Meta<typeof RgoTablePagination> = {
  title: "Internal/RgoTablePagination",
  tags: ["autodocs"],
  component: RgoTablePagination,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    pagination: {
      control: false,
      description: "Current pagination state including page, rowsPerPage, sortBy, and sortDirection",
    },
    onPaginationChange: {
      control: false,
      description: "Callback function to handle pagination state changes",
      table: {
        type: { summary: "ReactStateSetter<PageableParams>" },
      },
    },
    count: {
      control: { type: "number", min: 0 },
      description: "Total number of items across all pages",
    },
    rowsPerPageOptions: {
      control: "object",
      description: "Array of available rows per page options",
      table: {
        type: { summary: "readonly number[]" },
      },
    },
  },
  args: {
    rowsPerPageOptions: [10, 20, 50],
    count: 100,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: args => <RgoTablePaginationWithDefaultsDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Table pagination with default configuration.",
      },
      source: {
        code: RgoTablePaginationWithDefaultsDemoCode,
      },
    },
  },
};
