import CustomizedFallbacksExample from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/CustomizedFallbacksExample";
import customizedFallbacksSource from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/CustomizedFallbacksExample.tsx?raw";
import CustomizedSlotsExample from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/CustomizedSlotsExample";
import customizedSlotsSource from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/DefaultExample";
import defaultSource from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/DefaultExample.tsx?raw";
import ErrorAndRetryExample from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/ErrorAndRetryExample";
import errorAndRetrySource from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/ErrorAndRetryExample.tsx?raw";
import ErrorDetailsExample from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/ErrorDetailsExample";
import errorDetailsSource from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/ErrorDetailsExample.tsx?raw";
import LoadingExample from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/LoadingExample";
import loadingSource from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/LoadingExample.tsx?raw";
import NestedBoundariesExample from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/NestedBoundariesExample";
import nestedBoundariesSource from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/NestedBoundariesExample.tsx?raw";
import ResetKeysExample from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/ResetKeysExample";
import resetKeysSource from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/ResetKeysExample.tsx?raw";
import ThemeCustomizationExample from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/ThemeCustomizationExample";
import themeCustomizationSource from "@/integrations/tanstack-query/components/feedback/VireoQueryBoundary/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { VireoQueryBoundary } from "./VireoQueryBoundary";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "TypeScript/UI/Integrations/TanStack Query/VireoQueryBoundary",
  component: VireoQueryBoundary,
  tags: ["autodocs"],
  args: { children: null },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoQueryBoundary coordinates Suspense loading, descendant errors, and local TanStack Query reset behavior.

### Why it exists

Suspense query surfaces otherwise repeat loading semantics, safe error presentation, retry wiring, reset-key handling, and optional diagnostic disclosure. Vireo owns that integration contract while leaving QueryClient creation and query options native to TanStack Query. Use it around one independently recoverable query region; use upstream boundaries directly when an application needs different orchestration.`,
      },
    },
  },
  argTypes: { slots: { control: false }, slotProps: { control: false }, classes: { control: false } },
} satisfies Meta<typeof VireoQueryBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <DefaultExample />, parameters: source(defaultSource) };
export const Loading: Story = { render: () => <LoadingExample />, parameters: source(loadingSource) };
export const ErrorAndRetry: Story = {
  render: () => <ErrorAndRetryExample />,
  parameters: source(errorAndRetrySource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Retry" }));
    await expect(await canvas.findByText("Customer activity restored")).toBeInTheDocument();
  },
};
export const ErrorDetails: Story = {
  render: () => <ErrorDetailsExample />,
  parameters: source(errorDetailsSource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Show error details" }));
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Error details" }),
    ).toBeInTheDocument();
  },
};
export const ResetKeys: Story = {
  render: () => <ResetKeysExample />,
  parameters: source(resetKeysSource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Change reset key" }));
    await expect(await canvas.findByText("Reports route loaded")).toBeInTheDocument();
  },
};
export const NestedBoundaries: Story = {
  render: () => <NestedBoundariesExample />,
  parameters: source(nestedBoundariesSource),
};
export const CustomizedFallbacks: Story = {
  render: () => <CustomizedFallbacksExample />,
  parameters: source(customizedFallbacksSource),
};
export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: source(customizedSlotsSource),
};
export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: source(themeCustomizationSource),
};
