import CustomizedSlotsExample from "@/integrations/sonner/components/feedback/VireoToaster/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/integrations/sonner/components/feedback/VireoToaster/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/integrations/sonner/components/feedback/VireoToaster/internal/storybook/DefaultExample";
import defaultExampleSource from "@/integrations/sonner/components/feedback/VireoToaster/internal/storybook/DefaultExample.tsx?raw";
import PromiseLifecycleExample from "@/integrations/sonner/components/feedback/VireoToaster/internal/storybook/PromiseLifecycleExample";
import promiseLifecycleExampleSource from "@/integrations/sonner/components/feedback/VireoToaster/internal/storybook/PromiseLifecycleExample.tsx?raw";
import ResponsiveDefaultsExample from "@/integrations/sonner/components/feedback/VireoToaster/internal/storybook/ResponsiveDefaultsExample";
import responsiveDefaultsExampleSource from "@/integrations/sonner/components/feedback/VireoToaster/internal/storybook/ResponsiveDefaultsExample.tsx?raw";
import ScopedToasterExample from "@/integrations/sonner/components/feedback/VireoToaster/internal/storybook/ScopedToasterExample";
import scopedToasterExampleSource from "@/integrations/sonner/components/feedback/VireoToaster/internal/storybook/ScopedToasterExample.tsx?raw";
import StackingExample from "@/integrations/sonner/components/feedback/VireoToaster/internal/storybook/StackingExample";
import stackingExampleSource from "@/integrations/sonner/components/feedback/VireoToaster/internal/storybook/StackingExample.tsx?raw";
import ThemeCustomizationExample from "@/integrations/sonner/components/feedback/VireoToaster/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/integrations/sonner/components/feedback/VireoToaster/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoToaster } from "./VireoToaster";

function createSourceParameters(code: string) {
  return {
    docs: {
      source: {
        code,
        language: "tsx",
        type: "code" as const,
      },
    },
  };
}

const meta = {
  title: "UI/Integrations/Notifications · Sonner/VireoToaster",
  component: VireoToaster,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoToaster renders Vireo's single global, MUI-themed Sonner notification region.

### Why it exists

Transient application feedback otherwise repeats placement, responsive behavior, safe-area offsets, duration, stacking, direction, accessibility, and theme wiring in every application. Vireo standardizes that global delivery surface while preserving Sonner's native toast API. Render it once beneath the MUI theme; use inline feedback for validation, persistent errors, and complex recovery workflows.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoToaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const ActionsAndDismissal: Story = {
  render: () => <ActionsAndDismissalExample />,
  parameters: createSourceParameters(actionsAndDismissalExampleSource),
};

export const PromiseLifecycle: Story = {
  render: () => <PromiseLifecycleExample />,
  parameters: createSourceParameters(promiseLifecycleExampleSource),
};

export const Stacking: Story = {
  render: () => <StackingExample />,
  parameters: createSourceParameters(stackingExampleSource),
};

export const ResponsiveDefaults: Story = {
  render: () => <ResponsiveDefaultsExample />,
  parameters: createSourceParameters(responsiveDefaultsExampleSource),
};

export const ScopedToaster: Story = {
  render: () => <ScopedToasterExample />,
  parameters: createSourceParameters(scopedToasterExampleSource),
};

export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: createSourceParameters(customizedSlotsExampleSource),
};

export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: createSourceParameters(themeCustomizationExampleSource),
};
import ActionsAndDismissalExample from "@/integrations/sonner/components/feedback/VireoToaster/internal/storybook/ActionsAndDismissalExample";
import actionsAndDismissalExampleSource from "@/integrations/sonner/components/feedback/VireoToaster/internal/storybook/ActionsAndDismissalExample.tsx?raw";
