import {
  UseTabsWithDefaultsDemo,
  UseTabsWithDefaultsDemoCode,
} from "@/hooks/useRgoTabs/stories/UseRgoTabsWithDefaultsDemo";
import { UseTabsWithIconsDemo, UseTabsWithIconsDemoCode } from "@/hooks/useRgoTabs/stories/UseRgoTabsWithIconsDemo";
import {
  UseTabsWithUrlStateDemo,
  UseTabsWithUrlStateDemoCode,
} from "@/hooks/useRgoTabs/stories/UseRgoTabsWithUrlStateDemo";
import { type useRgoTabs } from "@/hooks/useRgoTabs/useRgoTabs";
import { RgoBrowserMock } from "@/hooks/useRgoUrlState/stories/RgoBrowserMock";
import type { Meta, StoryObj } from "@storybook/react-vite";

const USE_TABS_DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A custom React hook that simplifies the management of tab states. It provides a way to handle the active tab, change events, and accessibility properties for each tab.

## Stories

- [With default props](#with-default-props)
- [With icons](#with-icons)

## Usage

\`\`\`tsx
${UseTabsWithDefaultsDemoCode}
\`\`\``;

const meta: Meta<typeof useRgoTabs> = {
  title: "Hooks/useRgoTabs",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: USE_TABS_DESCRIPTION,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "With default props",
  render: () => <UseTabsWithDefaultsDemo />,
  parameters: {
    docs: {
      source: {
        code: UseTabsWithDefaultsDemoCode,
      },
    },
  },
};

export const WithIcons: Story = {
  name: "With icons",
  render: () => <UseTabsWithIconsDemo />,
  parameters: {
    docs: {
      source: {
        code: UseTabsWithIconsDemoCode,
      },
    },
  },
};

export const WithUrlState: Story = {
  name: "With URL state",
  render: () => (
    <RgoBrowserMock includedUrlParams={["currentTab"]}>
      <UseTabsWithUrlStateDemo />
    </RgoBrowserMock>
  ),
  parameters: {
    docs: {
      source: {
        code: UseTabsWithUrlStateDemoCode,
      },
    },
  },
};
