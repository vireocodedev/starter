import CompleteAnatomyExample from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/CompleteAnatomyExample";
import completeAnatomyExampleSource from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/CompleteAnatomyExample.tsx?raw";
import DefaultExample from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/DefaultExample.tsx?raw";
import DisabledCloseExample from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/DisabledCloseExample";
import disabledCloseExampleSource from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/DisabledCloseExample.tsx?raw";
import LongTitleExample from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/LongTitleExample";
import longTitleExampleSource from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/LongTitleExample.tsx?raw";
import StickyBehaviorExample from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/StickyBehaviorExample";
import stickyBehaviorExampleSource from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/StickyBehaviorExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";
import { VireoOverlayHeader } from "./VireoOverlayHeader";
import type { VireoOverlayHeaderCloseProps, VireoOverlayHeaderOwnProps } from "./VireoOverlayHeader.types";

type StoryArgs = VireoOverlayHeaderOwnProps & {
  [TPropName in keyof VireoOverlayHeaderCloseProps]?: VireoOverlayHeaderCloseProps[TPropName];
};
const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta: Meta<typeof VireoOverlayHeader> = {
  title: "TypeScript/UI/Capabilities/Overlays/VireoOverlayHeader",
  component: VireoOverlayHeader,
  tags: ["autodocs"],
  args: { title: "Edit invoice" },
  parameters: {
    layout: "padded",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Provides the standard header anatomy for Vireo dialogs, drawers, bottom sheets, and side panels.\n\n### Why it exists\n\nOverlay headers repeatedly need the same title, action, close-control, sticky-layout, and accessibility relationships. Centralizing that anatomy prevents each overlay surface from developing subtly different ordering, labeling, and customization behavior. Use it for Vireo overlay surfaces; an ordinary MUI-only dialog can continue to use DialogTitle.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = { render: () => <DefaultExample />, parameters: source(defaultExampleSource) };
export const CompleteAnatomy: Story = {
  args: { onClose: fn(), closeLabel: "Close invoice editor" },
  render: ({ onClose }) => <CompleteAnatomyExample onClose={onClose ?? (() => undefined)} />,
  parameters: source(completeAnatomyExampleSource),
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Close invoice editor" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};
export const DisabledClose: Story = {
  render: () => <DisabledCloseExample />,
  parameters: source(disabledCloseExampleSource),
};
export const LongTitle: Story = { render: () => <LongTitleExample />, parameters: source(longTitleExampleSource) };
export const StickyBehavior: Story = {
  render: () => <StickyBehaviorExample />,
  parameters: source(stickyBehaviorExampleSource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stickySurface = canvas.getByRole("region", { name: "Sticky header example" });
    const nonStickySurface = canvas.getByRole("region", { name: "Non-sticky header example" });
    stickySurface.scrollTop = 96;
    nonStickySurface.scrollTop = 96;
    fireEvent.scroll(stickySurface);
    fireEvent.scroll(nonStickySurface);
    await expect(stickySurface).toHaveProperty("scrollTop", 96);
    await expect(nonStickySurface).toHaveProperty("scrollTop", 96);
  },
};
