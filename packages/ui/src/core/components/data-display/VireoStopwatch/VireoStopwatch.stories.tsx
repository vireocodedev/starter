import DefaultExample from "@/core/components/data-display/VireoStopwatch/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/data-display/VireoStopwatch/internal/storybook/DefaultExample.tsx?raw";
import DurationFormatsExample from "@/core/components/data-display/VireoStopwatch/internal/storybook/DurationFormatsExample";
import durationFormatsExampleSource from "@/core/components/data-display/VireoStopwatch/internal/storybook/DurationFormatsExample.tsx?raw";
import StoppedDurationExample from "@/core/components/data-display/VireoStopwatch/internal/storybook/StoppedDurationExample";
import stoppedDurationExampleSource from "@/core/components/data-display/VireoStopwatch/internal/storybook/StoppedDurationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoStopwatch } from "./VireoStopwatch";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "UI/Core/Data Display/VireoStopwatch",
  component: VireoStopwatch,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoStopwatch presents a live or completed elapsed duration with stable, compact formatting.

### Why it exists

Operational interfaces repeatedly need to show how long a session, request, process, or task has been running. Vireo owns the ticking lifecycle, long-duration formatting, tabular-number layout, and timer semantics so consumers do not rebuild subtly inconsistent counters. Use it for elapsed duration from a timestamp; use ordinary text when the value is already formatted or does not need to update.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoStopwatch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <DefaultExample />, parameters: source(defaultExampleSource) };
export const StoppedDuration: Story = {
  render: () => <StoppedDurationExample />,
  parameters: source(stoppedDurationExampleSource),
};
export const DurationFormats: Story = {
  render: () => <DurationFormatsExample />,
  parameters: source(durationFormatsExampleSource),
};
