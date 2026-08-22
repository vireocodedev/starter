import CustomizedPullerExample from "@/capabilities/overlays/components/overlays/VireoBottomDrawer/internal/storybook/CustomizedPullerExample";
import customizedPullerExampleSource from "@/capabilities/overlays/components/overlays/VireoBottomDrawer/internal/storybook/CustomizedPullerExample.tsx?raw";
import DefaultExample from "@/capabilities/overlays/components/overlays/VireoBottomDrawer/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/overlays/components/overlays/VireoBottomDrawer/internal/storybook/DefaultExample.tsx?raw";
import FixedHeightExample from "@/capabilities/overlays/components/overlays/VireoBottomDrawer/internal/storybook/FixedHeightExample";
import fixedHeightExampleSource from "@/capabilities/overlays/components/overlays/VireoBottomDrawer/internal/storybook/FixedHeightExample.tsx?raw";
import WithoutBackdropExample from "@/capabilities/overlays/components/overlays/VireoBottomDrawer/internal/storybook/WithoutBackdropExample";
import withoutBackdropExampleSource from "@/capabilities/overlays/components/overlays/VireoBottomDrawer/internal/storybook/WithoutBackdropExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { VireoBottomDrawer } from "./VireoBottomDrawer";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "UI/Capabilities/Overlays/VireoBottomDrawer",
  component: VireoBottomDrawer,
  tags: ["autodocs"],
  args: { open: false, onClose: fn(), children: null },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Provides the standard swipeable mobile bottom-sheet surface, puller, sizing, and lifecycle wiring.\n\n### Why it exists\n\nMobile workflows repeatedly need the same bottom anchoring, safe swipe configuration, grab-handle anatomy, rounded paper, backdrop behavior, and fixed-versus-content height rules. Vireo owns that surface so responsive flows do not rebuild subtly different sheets. Use it for mobile bottom sheets; use a dialog or side drawer when swipeable bottom-sheet behavior is not appropriate.",
      },
    },
  },
} satisfies Meta<typeof VireoBottomDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ onClose }) => <DefaultExample onClose={onClose} />,
  parameters: source(defaultExampleSource),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open customer filters" }));
    await expect(within(canvasElement.ownerDocument.body).getByText("Filter customers")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};
export const FixedHeight: Story = {
  render: () => <FixedHeightExample />,
  parameters: source(fixedHeightExampleSource),
};
export const WithoutBackdrop: Story = {
  render: () => <WithoutBackdropExample />,
  parameters: source(withoutBackdropExampleSource),
};
export const CustomizedPuller: Story = {
  render: () => <CustomizedPullerExample />,
  parameters: source(customizedPullerExampleSource),
};
