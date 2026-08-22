import DefaultExample from "@/capabilities/page-layout/components/layout/VireoPageHeader/internal/storybook/DefaultExample";
import defaultSource from "@/capabilities/page-layout/components/layout/VireoPageHeader/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoPageHeader } from "./VireoPageHeader";
const meta = {
  title: "Capabilities/Page Layout/VireoPageHeader",
  component: VireoPageHeader,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "VireoPageHeader aligns leading navigation, a truncating title, and trailing page actions.\n\n## Why it exists\n\nPage headers otherwise drift in spacing, semantic structure, title overflow, and action alignment. Use it for the primary header row inside VireoPage.",
      },
    },
  },
} satisfies Meta<typeof VireoPageHeader>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: { docs: { source: { code: defaultSource } } },
};
