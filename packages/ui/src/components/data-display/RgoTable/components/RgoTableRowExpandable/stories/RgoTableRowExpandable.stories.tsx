import { RgoTableRowExpandable } from "@/components/data-display/RgoTable/components/RgoTableRowExpandable/RgoTableRowExpandable";
import {
  RgoTableRowExpandableWithDefaultsDemo,
  RgoTableRowExpandableWithDefaultsDemoCode,
} from "@/components/data-display/RgoTable/components/RgoTableRowExpandable/stories/RgoTableRowExpandableWithDefaultsDemo";
import {
  RgoTableRowExpandableWithDisabledDemo,
  RgoTableRowExpandableWithDisabledDemoCode,
} from "@/components/data-display/RgoTable/components/RgoTableRowExpandable/stories/RgoTableRowExpandableWithDisabledDemo";
import {
  RgoTableRowExpandableWithHighlightedDemo,
  RgoTableRowExpandableWithHighlightedDemoCode,
} from "@/components/data-display/RgoTable/components/RgoTableRowExpandable/stories/RgoTableRowExpandableWithHighlightedDemo";
import {
  RgoTableRowExpandableWithMultipleRowsDemo,
  RgoTableRowExpandableWithMultipleRowsDemoCode,
} from "@/components/data-display/RgoTable/components/RgoTableRowExpandable/stories/RgoTableRowExpandableWithMultipleRowsDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A component designed to create expandable rows within a table. It allows for a more detailed view of a specific row's data by expanding to reveal additional content, such as user details or project information. This component is particularly useful for displaying complex data sets in a more digestible format.

## Stories

- [With default props](#with-default-props)
- [With multiple rows](#with-multiple-rows)
- [With different data types](#with-different-data-types)
- [With row highlighting](#with-row-highlighting)
- [With disabled rows](#with-disabled-rows)

## Usage
\`\`\`tsx
${RgoTableRowExpandableWithDefaultsDemoCode}
\`\`\``;

const meta: Meta<typeof RgoTableRowExpandable> = {
  title: "Internal/RgoTableRowExpandable",
  component: RgoTableRowExpandable,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    item: {
      control: false,
      description: "The data item to display in the row",
      table: {
        type: { summary: "T" },
      },
    },
    columns: {
      control: false,
      description: "Array of column definitions for the table",
      table: {
        type: { summary: "DtBaseColumn<T>[]" },
      },
    },
    AccordionComponent: {
      control: false,
      description: "React component to render in the expanded content area",
      table: {
        type: { summary: "React.ComponentType<{ element: T }>" },
      },
    },
    highlighted: {
      control: false,
      description: "Function to determine if the row should be highlighted",
      table: {
        type: { summary: "(element: T) => boolean" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Whether the row expansion is disabled (no expand icon shown and accordion cannot be opened)",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaults: Story = {
  name: "With default props",
  render: () => <RgoTableRowExpandableWithDefaultsDemo />,
  parameters: {
    docs: {
      source: {
        code: RgoTableRowExpandableWithDefaultsDemoCode,
      },
    },
  },
};

export const WithMultipleRows: Story = {
  name: "With multiple rows",
  render: () => <RgoTableRowExpandableWithMultipleRowsDemo />,
  parameters: {
    docs: {
      source: {
        code: RgoTableRowExpandableWithMultipleRowsDemoCode,
      },
    },
  },
};

export const WithRowHighlighting: Story = {
  name: "With row highlighting",
  render: () => <RgoTableRowExpandableWithHighlightedDemo />,
  parameters: {
    docs: {
      source: {
        code: RgoTableRowExpandableWithHighlightedDemoCode,
      },
    },
  },
};

export const WithDisabledRows: Story = {
  name: "With disabled rows",
  render: () => <RgoTableRowExpandableWithDisabledDemo />,
  parameters: {
    docs: {
      source: {
        code: RgoTableRowExpandableWithDisabledDemoCode,
      },
    },
  },
};
