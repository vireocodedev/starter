import DefaultExample from "@/integrations/tanstack-query/hooks/useVireoMutation/internal/storybook/DefaultExample";
import defaultExampleSource from "@/integrations/tanstack-query/hooks/useVireoMutation/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Integrations/TanStack Query/useVireoMutation",
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Extends a TanStack Query mutation with optional Vireo success and error notifications.\n\n### Why it exists\n\nMutation flows repeatedly compose TanStack callbacks, semantic notifications, and safe diagnostic disclosure. Vireo centralizes that presentation wiring while preserving TanStack's native mutation options and requiring Zod validation before an application-selected error payload can be rendered. Use it for mutations that need Vireo feedback; use TanStack Query's `useMutation` directly when the application owns different presentation behavior.",
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
        story: "Shows success feedback and a schema-validated error-details disclosure using the same mutation.",
      },
      source: { code: defaultExampleSource, language: "tsx", type: "code" },
    },
  },
};
