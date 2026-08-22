import DefaultExample from "@/capabilities/page-layout/components/layout/VireoPageBody/internal/storybook/DefaultExample";
import defaultSource from "@/capabilities/page-layout/components/layout/VireoPageBody/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoPageBody } from "./VireoPageBody";
const meta = {
  title: "Capabilities/Page Layout/VireoPageBody",
  component: VireoPageBody,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "VireoPageBody owns the scrolling content region, responsive padding, max-width container, and optional drawer sibling.\n\n## Why it exists\n\nApplication pages repeatedly need identical flex constraints and padding changes when their own container becomes compact. Keep this behavior here so nested or docked pages remain responsive without viewport assumptions.",
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof VireoPageBody>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: { docs: { source: { code: defaultSource } } },
};
