import DefaultExample from "@/core/components/layout/VireoSlidingScreenStack/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/layout/VireoSlidingScreenStack/internal/storybook/DefaultExample.tsx?raw";
import PreservedScreenStateExample from "@/core/components/layout/VireoSlidingScreenStack/internal/storybook/PreservedScreenStateExample";
import preservedScreenStateExampleSource from "@/core/components/layout/VireoSlidingScreenStack/internal/storybook/PreservedScreenStateExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { VireoSlidingScreenStack } from "./VireoSlidingScreenStack";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "Core/Layout/VireoSlidingScreenStack",
  component: VireoSlidingScreenStack,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `Keeps a set of full-width screens mounted while animating controlled navigation between them.

### Why it exists

Multi-step and drill-in interfaces often need to preserve each screen's local state while moving horizontally between levels. Vireo owns the track geometry, transition, and active-screen semantics. Use it for a small controlled stack of adjacent views; use routing when screens need URLs, independent loading, or browser history.`,
      },
    },
  },
  args: { activeScreen: "overview", screens: [] },
  argTypes: {
    screens: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoSlidingScreenStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: source(defaultExampleSource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open details" }));
    await expect(canvas.getByRole("button", { name: "Back to overview" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Back to overview" }));
  },
};
export const PreservedScreenState: Story = {
  render: () => <PreservedScreenStateExample />,
  parameters: source(preservedScreenStateExampleSource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Add draft edit" }));
    await userEvent.click(canvas.getByRole("button", { name: "Review draft" }));
    await userEvent.click(canvas.getByRole("button", { name: "Return to draft" }));
    await expect(canvas.getByText("Draft edits: 1")).toBeVisible();
  },
};
