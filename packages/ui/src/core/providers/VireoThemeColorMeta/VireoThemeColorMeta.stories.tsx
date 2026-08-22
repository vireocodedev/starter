import DefaultExample from "@/core/providers/VireoThemeColorMeta/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/providers/VireoThemeColorMeta/internal/storybook/DefaultExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "UI/Core/Providers/VireoThemeColorMeta",
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Synchronizes one browser theme-color meta tag with an explicit color or the active MUI theme.\n\n### Why it exists\n\nInstalled and mobile browser chrome should follow application surfaces without destructive document-wide meta manipulation. Vireo owns one reversible tag lifecycle and preserves unrelated media variants. Use it near the application theme provider; manage document metadata elsewhere when a framework already owns the complete head.",
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
      description: { story: "Updates the unqualified browser theme color whenever the active theme changes." },
      source: { code: defaultExampleSource, language: "tsx", type: "code" },
    },
  },
};
