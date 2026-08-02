import { RgoTabs } from "@/components/navigation/RgoTabs/RgoTabs";
import {
  RgoTabsWithDefaultPropsDemo,
  RgoTabsWithDefaultPropsDemoCode,
} from "@/components/navigation/RgoTabs/stories/RgoTabsWithDefaultPropsDemo";
import {
  RgoTabsWithInitialTabDemo,
  RgoTabsWithInitialTabDemoCode,
} from "@/components/navigation/RgoTabs/stories/RgoTabsWithInitialTabDemo";
import {
  RgoTabsWithRichContentDemo,
  RgoTabsWithRichContentDemoCode,
} from "@/components/navigation/RgoTabs/stories/RgoTabsWithRichContentDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A tab navigation component that renders a set of tabs with associated content panels. Supports initial tab selection and URL-based tab state persistence.

## Stories

- [With default props](#with-default-props)
- [With initial tab](#with-initial-tab)
- [With rich content](#with-rich-content)

## Usage

\`\`\`tsx
${RgoTabsWithDefaultPropsDemoCode}
\`\`\``;

const meta = {
  title: "Components/Navigation/RgoTabs",
  component: RgoTabs,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    tabs: {
      control: false,
      description: "Array of tab items with label and content",
      table: {
        type: { summary: "RgoTabItem[]" },
      },
    },
    initialTab: {
      control: "number",
      description: "The initially selected tab index",
      table: {
        defaultValue: { summary: "0" },
        type: { summary: "number" },
      },
    },
    useUrlForTabState: {
      control: "boolean",
      description: "Whether to persist the active tab in the URL",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
      },
    },
    urlParamKey: {
      control: "text",
      description: "The URL search param key for tab state",
      table: {
        defaultValue: { summary: '"currentTab"' },
        type: { summary: "string" },
      },
    },
  },
  args: {
    tabs: [],
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RgoTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: args => <RgoTabsWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Tabs with default configuration.",
      },
      source: {
        code: RgoTabsWithDefaultPropsDemoCode,
      },
    },
  },
};

export const WithInitialTab: Story = {
  name: "With initial tab",
  render: () => <RgoTabsWithInitialTabDemo />,
  parameters: {
    docs: {
      description: {
        story: "Tabs with second tab initially selected.",
      },
      source: {
        code: RgoTabsWithInitialTabDemoCode,
      },
    },
  },
};

export const WithRichContent: Story = {
  name: "With rich content",
  render: () => <RgoTabsWithRichContentDemo />,
  parameters: {
    docs: {
      description: {
        story: "Tabs with rich content like cards and lists.",
      },
      source: {
        code: RgoTabsWithRichContentDemoCode,
      },
    },
  },
};
