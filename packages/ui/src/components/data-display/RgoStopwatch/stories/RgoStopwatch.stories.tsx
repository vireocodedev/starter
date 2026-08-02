import { RgoStopwatch } from "@/components/data-display/RgoStopwatch/RgoStopwatch";
import {
  RgoStopwatchWithDefaultPropsDemo,
  RgoStopwatchWithDefaultPropsDemoCode,
} from "@/components/data-display/RgoStopwatch/stories/RgoStopwatchWithDefaultPropsDemo";
import {
  RgoStopwatchWithLongDurationDemo,
  RgoStopwatchWithLongDurationDemoCode,
} from "@/components/data-display/RgoStopwatch/stories/RgoStopwatchWithLongDurationDemo";
import {
  RgoStopwatchWithMediumDurationDemo,
  RgoStopwatchWithMediumDurationDemoCode,
} from "@/components/data-display/RgoStopwatch/stories/RgoStopwatchWithMediumDurationDemo";
import {
  RgoStopwatchWithShortDurationDemo,
  RgoStopwatchWithShortDurationDemoCode,
} from "@/components/data-display/RgoStopwatch/stories/RgoStopwatchWithShortDurationDemo";
import {
  RgoStopwatchWithVariationsDemo,
  RgoStopwatchWithVariationsDemoCode,
} from "@/components/data-display/RgoStopwatch/stories/RgoStopwatchWithVariationsDemo";
import {
  RgoStopwatchWithVeryLongDurationDemo,
  RgoStopwatchWithVeryLongDurationDemoCode,
} from "@/components/data-display/RgoStopwatch/stories/RgoStopwatchWithVeryLongDurationDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A customizable stopwatch component that displays elapsed time with automatic unit formatting. Shows years, months, weeks, days, hours, minutes, and seconds, but only displays units with values greater than zero.

## Stories
- [With default props](#with-default-props)
- [With short duration](#with-short-duration)
- [With medium duration](#with-medium-duration)
- [With long duration](#with-long-duration)
- [With very long duration](#with-very-long-duration)
- [With variations](#with-variations)

## Usage

\`\`\`tsx
${RgoStopwatchWithDefaultPropsDemoCode}
\`\`\``;

const meta = {
  title: "Components/Data display/RgoStopwatch",
  component: RgoStopwatch,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    startDate: {
      control: "number",
      description: "Timestamp in milliseconds to start counting from. If null or undefined, starts from current time.",
      table: {
        type: { summary: "number | null | undefined" },
      },
    },
  },
} satisfies Meta<typeof RgoStopwatch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoStopwatchWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Default stopwatch starting from current time showing MM:SS format for short durations.",
      },
      source: {
        code: RgoStopwatchWithDefaultPropsDemoCode,
      },
    },
  },
};

export const WithShortDuration: Story = {
  name: "With short duration",
  render: () => <RgoStopwatchWithShortDurationDemo />,
  parameters: {
    docs: {
      description: {
        story: "Stopwatch showing a short duration in MM:SS format.",
      },
      source: {
        code: RgoStopwatchWithShortDurationDemoCode,
      },
    },
  },
};

export const WithMediumDuration: Story = {
  name: "With medium duration",
  render: () => <RgoStopwatchWithMediumDurationDemo />,
  parameters: {
    docs: {
      description: {
        story: "Stopwatch showing medium duration with hours in HH:MM:SS format.",
      },
      source: {
        code: RgoStopwatchWithMediumDurationDemoCode,
      },
    },
  },
};

export const WithLongDuration: Story = {
  name: "With long duration",
  render: () => <RgoStopwatchWithLongDurationDemo />,
  parameters: {
    docs: {
      description: {
        story: "Stopwatch showing long duration with days, hours, minutes, and seconds.",
      },
      source: {
        code: RgoStopwatchWithLongDurationDemoCode,
      },
    },
  },
};

export const WithVeryLongDuration: Story = {
  name: "With very long duration",
  render: () => <RgoStopwatchWithVeryLongDurationDemo />,
  parameters: {
    docs: {
      description: {
        story: "Stopwatch showing very long duration with weeks, days, hours, minutes, and seconds.",
      },
      source: {
        code: RgoStopwatchWithVeryLongDurationDemoCode,
      },
    },
  },
};

export const WithVariations: Story = {
  name: "With variations",
  render: () => <RgoStopwatchWithVariationsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Various configurations showing different time durations and how the component automatically displays appropriate time units.",
      },
      source: {
        code: RgoStopwatchWithVariationsDemoCode,
      },
    },
  },
};
