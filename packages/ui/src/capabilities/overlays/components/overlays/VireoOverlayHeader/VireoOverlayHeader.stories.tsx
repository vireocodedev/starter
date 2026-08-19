import CompleteAnatomyExample from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/CompleteAnatomyExample";
import completeAnatomyExampleSource from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/CompleteAnatomyExample.tsx?raw";
import ClosableExample from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/ClosableExample";
import closableExampleSource from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/ClosableExample.tsx?raw";
import CustomizedSlotsExample from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/DefaultExample.tsx?raw";
import DisabledCloseExample from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/DisabledCloseExample";
import disabledCloseExampleSource from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/DisabledCloseExample.tsx?raw";
import LongTitleExample from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/LongTitleExample";
import longTitleExampleSource from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/LongTitleExample.tsx?raw";
import NonStickyExample from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/NonStickyExample";
import nonStickyExampleSource from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/NonStickyExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { VireoOverlayHeader } from "./VireoOverlayHeader";
import type { VireoOverlayHeaderCloseProps, VireoOverlayHeaderOwnProps } from "./VireoOverlayHeader.types";

type StoryArgs = VireoOverlayHeaderOwnProps & {
  [TPropName in keyof VireoOverlayHeaderCloseProps]?: VireoOverlayHeaderCloseProps[TPropName];
};
const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta: Meta<typeof VireoOverlayHeader> = {
  title: "Overlays/Overlays/VireoOverlayHeader",
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
};
export const Closable: Story = {
  args: { onClose: fn(), closeLabel: "Close invoice editor" },
  render: ({ onClose }) => <ClosableExample onClose={onClose ?? (() => undefined)} />,
  parameters: source(closableExampleSource),
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Close invoice editor" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};
export const DisabledClose: Story = {
  render: () => <DisabledCloseExample />,
  parameters: source(disabledCloseExampleSource),
};
export const NonSticky: Story = { render: () => <NonStickyExample />, parameters: source(nonStickyExampleSource) };
export const LongTitle: Story = { render: () => <LongTitleExample />, parameters: source(longTitleExampleSource) };
export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: source(customizedSlotsExampleSource),
};
export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: source(themeCustomizationExampleSource),
};
