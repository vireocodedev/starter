import DefaultExample from "@/capabilities/forms/form-overlays/components/overlays/VireoResponsiveFormOverlay/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/form-overlays/components/overlays/VireoResponsiveFormOverlay/internal/storybook/DefaultExample.tsx?raw";
import DesktopSidePanelExample from "@/capabilities/forms/form-overlays/components/overlays/VireoResponsiveFormOverlay/internal/storybook/DesktopSidePanelExample";
import desktopSidePanelExampleSource from "@/capabilities/forms/form-overlays/components/overlays/VireoResponsiveFormOverlay/internal/storybook/DesktopSidePanelExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoResponsiveFormOverlay } from "./VireoResponsiveFormOverlay";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });
const requiredArgs = {
  open: false,
  onClose: () => undefined,
  title: "Edit profile",
  closeLabel: "Close profile form",
  children: null,
};

const meta = {
  title: "Capabilities/Forms/Overlays/VireoResponsiveFormOverlay",
  component: VireoResponsiveFormOverlay,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Coordinates a form across Vireo's mobile bottom sheet and desktop overlay surfaces.\n\n### Why it exists\n\nResponsive form workflows otherwise repeat surface selection, header anatomy, action placement, close disabling, and unsaved-change scoping. Use this coordinator when one form moves between mobile and desktop overlays; use a direct overlay when the surface never changes.",
      },
    },
  },
} satisfies Meta<typeof VireoResponsiveFormOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: requiredArgs,
  render: () => <DefaultExample />,
  parameters: source(defaultExampleSource),
};
export const DesktopSidePanel: Story = {
  args: requiredArgs,
  render: () => <DesktopSidePanelExample />,
  parameters: source(desktopSidePanelExampleSource),
};
