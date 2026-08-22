import DefaultExample from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/DefaultExample.tsx?raw";
import AsyncValidationExample from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/AsyncValidationExample";
import asyncValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/AsyncValidationExample.tsx?raw";
import CompactProgressExample from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/CompactProgressExample";
import compactProgressExampleSource from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/CompactProgressExample.tsx?raw";
import CompleteErrorSummaryExample from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/CompleteErrorSummaryExample";
import completeErrorSummaryExampleSource from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/CompleteErrorSummaryExample.tsx?raw";
import ConditionalStepsExample from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/ConditionalStepsExample";
import conditionalStepsExampleSource from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/ConditionalStepsExample.tsx?raw";
import CustomizedSlotsExample from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/CustomizedSlotsExample.tsx?raw";
import FieldValidationExample from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/FieldValidationExample";
import fieldValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/FieldValidationExample.tsx?raw";
import KeepMountedExample from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/KeepMountedExample";
import keepMountedExampleSource from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/KeepMountedExample.tsx?raw";
import NavigationPoliciesExample from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/NavigationPoliciesExample";
import navigationPoliciesExampleSource from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/NavigationPoliciesExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/ThemeCustomizationExample.tsx?raw";
import ZodFormSchemaExample from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/ZodFormSchemaExample";
import zodFormSchemaExampleSource from "@/capabilities/forms/components/forms/VireoFormMultiStep/internal/storybook/ZodFormSchemaExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormMultiStep } from "./VireoFormMultiStep";

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
  title: "UI/Capabilities/Forms/Multi-Step/VireoFormMultiStep",
  component: VireoFormMultiStep,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoFormMultiStep provides the stable composition boundary for one TanStack-backed multi-step form flow.

### Why it exists

Multi-step workflows otherwise repeat step registration, conditional visibility, focus movement, value preservation, locale wiring, and reset behavior around the same form instance. Vireo owns that coordination while leaving fields and visual progress explicit; use it for one schema and submission distributed across steps, not for unrelated forms connected only by routing.`,
      },
    },
    controls: { disable: true },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormMultiStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const ConditionalSteps: Story = {
  render: () => <ConditionalStepsExample />,
  parameters: createSourceParameters(conditionalStepsExampleSource),
};
export const ZodFormSchema: Story = {
  render: () => <ZodFormSchemaExample />,
  parameters: createSourceParameters(zodFormSchemaExampleSource),
};
export const FieldValidation: Story = {
  render: () => <FieldValidationExample />,
  parameters: createSourceParameters(fieldValidationExampleSource),
};
export const AsyncValidation: Story = {
  render: () => <AsyncValidationExample />,
  parameters: createSourceParameters(asyncValidationExampleSource),
};
export const CompleteErrorSummary: Story = {
  render: () => <CompleteErrorSummaryExample />,
  parameters: createSourceParameters(completeErrorSummaryExampleSource),
};
export const CompactProgress: Story = {
  render: () => <CompactProgressExample />,
  parameters: createSourceParameters(compactProgressExampleSource),
};
export const NavigationPolicies: Story = {
  render: () => <NavigationPoliciesExample />,
  parameters: createSourceParameters(navigationPoliciesExampleSource),
};
export const KeepMounted: Story = {
  render: () => <KeepMountedExample />,
  parameters: createSourceParameters(keepMountedExampleSource),
};
export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: createSourceParameters(customizedSlotsExampleSource),
};
export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: createSourceParameters(themeCustomizationExampleSource),
};
