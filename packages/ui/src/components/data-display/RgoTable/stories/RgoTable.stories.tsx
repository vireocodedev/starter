import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RgoTableOverviewDemo, RgoTableOverviewDemoCode } from "./RgoTableOverviewDemo";

const STORYBOOK_TITLE = "Components/Data display/RgoTable";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const DESCRIPTION = `RgoTable provides shared types (\`DtBaseProps\`, \`DtBaseColumn\`, \`PaginationProps\`) and sub-components for building data tables:

- **RgoTableCellSortable** — Sortable table header cell with sort direction indicators
- **RgoTablePagination** — Table pagination controls with rows-per-page selector
- **RgoTableRowExpandable** — Expandable table row with accordion content

See individual sub-component stories for detailed API documentation.`;
const STORY_NAMES = ["Overview"];

const meta: Meta = {
  title: STORYBOOK_TITLE,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: createStorybookDescription({
          badge: STORYBOOK_BADGE,
          description: DESCRIPTION,
          usage: RgoTableOverviewDemoCode,
          stories: createStories(STORY_NAMES),
        }),
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "Overview",
  render: () => <RgoTableOverviewDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "A complete table composed from RgoTable types and sub-components: sortable headers, paginated data, and column definitions.",
      },
      source: {
        code: RgoTableOverviewDemoCode,
      },
    },
  },
};
