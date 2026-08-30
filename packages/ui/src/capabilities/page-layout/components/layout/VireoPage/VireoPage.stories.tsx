import DefaultExample from "@/capabilities/page-layout/components/layout/VireoPage/internal/storybook/DefaultExample";
import defaultSource from "@/capabilities/page-layout/components/layout/VireoPage/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoPage } from "./VireoPage";
const meta = {
  title: "TypeScript/UI/Capabilities/Page Layout/VireoPage",
  component: VireoPage,
  tags: ["autodocs", "vireo-matrix"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "VireoPage establishes the bounded page frame and container-measured layout context.\n\n### Why it exists\n\nPage content must react to the space actually allocated by navigation and side surfaces, not merely viewport breakpoints. Use VireoPage as the root of a standard application page; provide mode only for an intentionally controlled layout.",
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof VireoPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: { docs: { source: { code: defaultSource } } },
};
