import DefaultExample from "@/capabilities/page-layout/components/surfaces/VireoResponsiveCard/internal/storybook/DefaultExample";
import defaultSource from "@/capabilities/page-layout/components/surfaces/VireoResponsiveCard/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoResponsiveCard } from "./VireoResponsiveCard";
const meta = {
  title: "Page Layout/Surfaces/VireoResponsiveCard",
  component: VireoResponsiveCard,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "VireoResponsiveCard keeps stable card markup and adapts its visual surface to the nearest Vireo page-layout mode.\n\n## Why it exists\n\nCards often become edge-to-edge content in compact containers. Vireo removes only the compact visual chrome, preserving refs, semantics, state, and child lifecycles across layout changes.",
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof VireoResponsiveCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: { docs: { source: { code: defaultSource } } },
};
