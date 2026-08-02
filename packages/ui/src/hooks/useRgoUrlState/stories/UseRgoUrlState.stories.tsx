import { RgoBrowserMock } from "@/hooks/useRgoUrlState/stories/RgoBrowserMock";
import {
  UseUrlStateWithTableDemo,
  UseUrlStateWithTableDemoCode,
} from "@/hooks/useRgoUrlState/stories/UseRgoUrlStateWithTableDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A custom React hook that manages state via URL parameters. It shares \`useState\`'s signature but syncs state with the URL for easy sharing and bookmarking.

## Stories

- [With table](#anchor--hooks-useurlstate--with-table)

## Usage

\`\`\`tsx
${UseUrlStateWithTableDemoCode}
\`\`\``;

const meta: Meta = {
  title: "Hooks/useRgoUrlState",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTable: Story = {
  name: "With table",
  render: () => (
    <RgoBrowserMock includedUrlParams={["pagination"]}>
      <UseUrlStateWithTableDemo />
    </RgoBrowserMock>
  ),
  parameters: {
    docs: {
      source: {
        code: UseUrlStateWithTableDemoCode,
      },
    },
  },
};
