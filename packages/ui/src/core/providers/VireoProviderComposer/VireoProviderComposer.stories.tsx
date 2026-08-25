import DefaultExample from "@/core/providers/VireoProviderComposer/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/providers/VireoProviderComposer/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "TypeScript/UI/Core/Providers/VireoProviderComposer",
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Composes configured React provider wrappers from outermost to innermost.\n\n### Why it exists\n\nApplication bootstrap trees become deeply nested while each provider still needs its own strongly typed props and explicit order. Vireo flattens that one composition point without owning integration configuration. Use it in a small application-local `AppProviders`; use explicit JSX when the provider tree is already short or when branching structure communicates important behavior.",
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
      description: { story: "Keeps provider-specific props type-checked while flattening the application root." },
      source: { code: defaultExampleSource, language: "tsx", type: "code" },
    },
  },
};
