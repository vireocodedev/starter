import type { Meta, StoryObj } from "@storybook/react-vite";
import AsyncLoadingExample from "@/capabilities/overlays/confirmation/components/overlays/VireoConfirmationDialog/internal/storybook/AsyncLoadingExample";
import asyncLoadingSource from "@/capabilities/overlays/confirmation/components/overlays/VireoConfirmationDialog/internal/storybook/AsyncLoadingExample.tsx?raw";
import DefaultExample from "@/capabilities/overlays/confirmation/components/overlays/VireoConfirmationDialog/internal/storybook/DefaultExample";
import defaultSource from "@/capabilities/overlays/confirmation/components/overlays/VireoConfirmationDialog/internal/storybook/DefaultExample.tsx?raw";
import ProviderHookExample from "@/capabilities/overlays/confirmation/components/overlays/VireoConfirmationDialog/internal/storybook/ProviderHookExample";
import providerHookSource from "@/capabilities/overlays/confirmation/components/overlays/VireoConfirmationDialog/internal/storybook/ProviderHookExample.tsx?raw";
import { VireoConfirmationDialog } from "./VireoConfirmationDialog";

const meta = {
  title: "Overlays/Confirmation/VireoConfirmationDialog",
  component: VireoConfirmationDialog,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "VireoConfirmationDialog presents a controlled confirmation decision with safe React content, explicit loading behavior, and replaceable semantic slots.\n\n## Why it exists\n\nDestructive and consequential actions otherwise recreate subtly different dialogs and frequently mix action execution with presentation state. Vireo centralizes the accessible surface while VireoConfirmationProvider offers an optional promise-based decision API. Message strings remain text; use React nodes when rich content is required.",
      },
    },
  },
  args: { open: false, title: "Confirm", message: "Continue?", onClose: () => undefined, onConfirm: () => undefined },
} satisfies Meta<typeof VireoConfirmationDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: { docs: { source: { code: defaultSource } } },
};
export const ProviderHook: Story = {
  render: () => <ProviderHookExample />,
  parameters: { docs: { source: { code: providerHookSource } } },
};
export const AsyncLoading: Story = {
  render: () => <AsyncLoadingExample />,
  parameters: { docs: { source: { code: asyncLoadingSource } } },
};
