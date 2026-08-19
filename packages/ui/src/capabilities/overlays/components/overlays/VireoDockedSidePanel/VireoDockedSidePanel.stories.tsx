import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, waitFor, within } from "storybook/test";
import ActiveResizeFeedbackExample from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/ActiveResizeFeedbackExample";
import activeResizeFeedbackExampleSource from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/ActiveResizeFeedbackExample.tsx?raw";
import CustomizedSlotsExample from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/DefaultExample.tsx?raw";
import LongContentExample from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/LongContentExample";
import longContentExampleSource from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/LongContentExample.tsx?raw";
import PointerResizeAndResetExample from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/PointerResizeAndResetExample";
import pointerResizeAndResetExampleSource from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/PointerResizeAndResetExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel/internal/storybook/ThemeCustomizationExample.tsx?raw";
import { VireoDockedSidePanel } from "./VireoDockedSidePanel";

const source = (code: string) => ({
  docs: { source: { code, language: "tsx", type: "code" as const } },
});

const meta = {
  title: "Overlays/Overlays/VireoDockedSidePanel",
  component: VireoDockedSidePanel,
  tags: ["autodocs"],
  args: { open: false, width: 420, minWidth: 280, maxWidth: 620, children: null },
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Provides an adjacent desktop overlay surface that reserves layout space while coordinating entry, exit, and resize transitions.\n\n### Why it exists\n\nDocked side panels must keep the surrounding layout, the visible surface, pointer resizing, and exit lifecycle synchronized. Centralizing that behavior prevents feature-level panels from implementing subtly different widths, motion, and cleanup semantics. Use it for persistent desktop panels beside primary content; use a drawer or modal surface when content should overlay the workspace instead of resizing it.",
      },
    },
  },
} satisfies Meta<typeof VireoDockedSidePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <DefaultExample />, parameters: source(defaultExampleSource) };

export const ActiveResizeFeedback: Story = {
  render: () => <ActiveResizeFeedbackExample />,
  parameters: source(activeResizeFeedbackExampleSource),
};

export const LongContent: Story = {
  render: () => <LongContentExample />,
  parameters: source(longContentExampleSource),
};

export const PointerResizeAndReset: Story = {
  render: () => <PointerResizeAndResetExample />,
  parameters: source(pointerResizeAndResetExampleSource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole("presentation");
    fireEvent.mouseDown(handle, { clientX: 800, detail: 1 });
    fireEvent.mouseMove(window, { clientX: 700 });
    fireEvent.mouseUp(window);
    await waitFor(() => expect(canvas.getByText("520px wide")).toBeInTheDocument());
    fireEvent.doubleClick(handle);
    await waitFor(() => expect(canvas.getByText("420px wide")).toBeInTheDocument());
  },
};

export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: source(customizedSlotsExampleSource),
};

export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: source(themeCustomizationExampleSource),
};
