import DefaultExample from "@/core/components/behavior/VireoDelayedRender/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/behavior/VireoDelayedRender/internal/storybook/DefaultExample.tsx?raw";
import FastAndSlowOperationsExample from "@/core/components/behavior/VireoDelayedRender/internal/storybook/FastAndSlowOperationsExample";
import fastAndSlowOperationsExampleSource from "@/core/components/behavior/VireoDelayedRender/internal/storybook/FastAndSlowOperationsExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { VireoDelayedRender } from "./VireoDelayedRender";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "TypeScript/UI/Core/Behavior/VireoDelayedRender",
  component: VireoDelayedRender,
  tags: ["autodocs"],
  args: { children: null },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Defers mounting transient fallback content until an operation outlasts a short buffer.\n\n### Why it exists\n\nImmediately rendering a skeleton or loader can produce a distracting flash when an operation completes quickly. This component applies one consistent delay and cleanup lifecycle so fallback content appears only when it remains useful. Use it for transient loading feedback, not for intentionally staged content or entrance animation.",
      },
    },
  },
  argTypes: {
    children: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoDelayedRender>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: source(defaultExampleSource),
};

export const FastAndSlowOperations: Story = {
  render: () => <FastAndSlowOperationsExample />,
  parameters: source(fastAndSlowOperationsExampleSource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Run fast operation" }));
    await waitFor(() => expect(canvas.getByText("Completed before fallback mounted")).toBeVisible());
    await expect(canvas.queryByText("Still loading…")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Reset demonstration" }));
  },
};
