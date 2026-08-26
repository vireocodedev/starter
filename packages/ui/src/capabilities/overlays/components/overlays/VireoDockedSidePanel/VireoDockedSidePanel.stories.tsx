import ActiveResizeFeedbackExample from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/ActiveResizeFeedbackExample";
import activeResizeFeedbackExampleSource from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/ActiveResizeFeedbackExample.tsx?raw";
import DefaultExample from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/DefaultExample.tsx?raw";
import OpenCloseLifecycleExample from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/OpenCloseLifecycleExample";
import openCloseLifecycleExampleSource from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/OpenCloseLifecycleExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { VireoDockedSidePanel } from "./VireoDockedSidePanel";

const source = (code: string) => ({
  docs: { source: { code, language: "tsx", type: "code" as const } },
});

const meta = {
  title: "TypeScript/UI/Capabilities/Overlays/VireoDockedSidePanel",
  component: VireoDockedSidePanel,
  tags: ["autodocs"],
  args: { open: false, width: 420, minWidth: 280, maxWidth: 620, children: null },
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Provides an adjacent desktop overlay surface that reserves layout space while coordinating entry, exit, and resize transitions.\n\n### Why it exists\n\nDocked side panels must keep the surrounding layout, the visible surface, accessible resizing, and exit lifecycle synchronized. Centralizing that behavior prevents feature-level panels from implementing subtly different widths, motion, and cleanup semantics. Use it for persistent desktop panels beside primary content; use a drawer or modal surface when content should overlay the workspace instead of resizing it.",
      },
    },
  },
} satisfies Meta<typeof VireoDockedSidePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: source(defaultExampleSource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole("separator", { name: "Resize panel" });
    fireEvent.pointerDown(handle, { clientX: 800, detail: 1 });
    fireEvent.pointerMove(window, { clientX: 700 });
    fireEvent.pointerUp(window);
    await waitFor(() => expect(canvas.getByText("520px wide")).toBeInTheDocument());
    fireEvent.doubleClick(handle);
    await waitFor(() => expect(canvas.getByText("420px wide")).toBeInTheDocument());
    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    await waitFor(() => expect(canvas.getByText("436px wide")).toBeInTheDocument());
  },
};

export const OpenCloseLifecycle: Story = {
  render: () => <OpenCloseLifecycleExample />,
  parameters: source(openCloseLifecycleExampleSource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Close invoice details" }));
    await waitFor(() => expect(canvas.queryByRole("complementary")).not.toBeInTheDocument());
    await userEvent.click(canvas.getByRole("button", { name: "Open panel" }));
    await waitFor(() => expect(canvas.getByRole("complementary")).toBeInTheDocument());
  },
};

export const ActiveResizeFeedback: Story = {
  render: () => <ActiveResizeFeedbackExample />,
  parameters: source(activeResizeFeedbackExampleSource),
};
