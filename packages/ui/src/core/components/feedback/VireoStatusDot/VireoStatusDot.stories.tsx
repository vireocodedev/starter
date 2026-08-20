import DefaultExample from "@/core/components/feedback/VireoStatusDot/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/feedback/VireoStatusDot/internal/storybook/DefaultExample.tsx?raw";
import SelectedSurfaceExample from "@/core/components/feedback/VireoStatusDot/internal/storybook/SelectedSurfaceExample";
import selectedSurfaceExampleSource from "@/core/components/feedback/VireoStatusDot/internal/storybook/SelectedSurfaceExample.tsx?raw";
import SemanticStatusesExample from "@/core/components/feedback/VireoStatusDot/internal/storybook/SemanticStatusesExample";
import semanticStatusesExampleSource from "@/core/components/feedback/VireoStatusDot/internal/storybook/SemanticStatusesExample.tsx?raw";
import StandaloneAccessibleStatusExample from "@/core/components/feedback/VireoStatusDot/internal/storybook/StandaloneAccessibleStatusExample";
import standaloneAccessibleStatusExampleSource from "@/core/components/feedback/VireoStatusDot/internal/storybook/StandaloneAccessibleStatusExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoStatusDot } from "./VireoStatusDot";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "Core/Feedback/VireoStatusDot",
  component: VireoStatusDot,
  tags: ["autodocs"],
  args: { color: "success" },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoStatusDot displays a compact, theme-aware semantic status marker.

### Why it exists

Statuses recur in dense tables, lists, chips, and summaries where a full badge would add unnecessary visual weight. This component standardizes their colors, sizing, selected-surface contrast, and accessible standalone labelling. Use adjacent text to convey meaning whenever space allows; color alone should not carry essential information.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoStatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <DefaultExample />, parameters: source(defaultExampleSource) };
export const SemanticStatuses: Story = {
  render: () => <SemanticStatusesExample />,
  parameters: source(semanticStatusesExampleSource),
};
export const SelectedSurface: Story = {
  render: () => <SelectedSurfaceExample />,
  parameters: source(selectedSurfaceExampleSource),
};
export const StandaloneAccessibleStatus: Story = {
  render: () => <StandaloneAccessibleStatusExample />,
  parameters: source(standaloneAccessibleStatusExampleSource),
};
