import DefaultExample from "@/integrations/event-source/hooks/useVireoEventSource/internal/storybook/DefaultExample";
import defaultExampleSource from "@/integrations/event-source/hooks/useVireoEventSource/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Integrations/Event Source/useVireoEventSource",
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Owns one native EventSource connection with reactive status, dynamic named listeners, and explicit reconnect control.\n\n### Why it exists\n\nApplications repeatedly need safe EventSource construction, cleanup, stale-event isolation, callback freshness, named listener updates, and observable native reconnection state. Vireo owns those browser lifecycle mechanics while leaving endpoints, authentication, payload decoding, schemas, visibility policy, and application synchronization to consumers. Use it for native browser SSE transport; use an application-specific client when custom headers, non-SSE streaming, or shared connection pooling are required.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Exercises the real hook against a deterministic in-memory EventSource, including native lifecycle state, dynamic listeners, Zod decoding, listener failures, and explicit reconnecting.",
      },
      source: { code: defaultExampleSource, language: "tsx", type: "code" },
    },
  },
};
