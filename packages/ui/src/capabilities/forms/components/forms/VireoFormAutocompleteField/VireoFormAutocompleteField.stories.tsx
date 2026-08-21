import AsyncSelectedOptionHydrationExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/AsyncSelectedOptionHydrationExample";
import asyncSelectedOptionHydrationSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/AsyncSelectedOptionHydrationExample.tsx?raw";
import CustomizedSlotsExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/CustomizedSlotsExample";
import customizedSlotsSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/DefaultExample";
import defaultSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/DefaultExample.tsx?raw";
import GroupedOptionsExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/GroupedOptionsExample";
import groupedOptionsSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/GroupedOptionsExample.tsx?raw";
import ServerFilteringAndLoadingExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/ServerFilteringAndLoadingExample";
import serverFilteringAndLoadingSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/ServerFilteringAndLoadingExample.tsx?raw";
import StatesAndInteractionsExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/StatesAndInteractionsExample";
import statesAndInteractionsSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/StatesAndInteractionsExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/ThemeCustomizationExample";
import themeCustomizationSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/ThemeCustomizationExample.tsx?raw";
import UnresolvedValueExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/UnresolvedValueExample";
import unresolvedValueSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/UnresolvedValueExample.tsx?raw";
import ZodFieldValidationExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/ZodFieldValidationExample";
import zodFieldValidationSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/ZodFieldValidationExample.tsx?raw";
import ZodFormValidationExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/ZodFormValidationExample";
import zodFormValidationSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/internal/storybook/ZodFormValidationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormAutocompleteField } from "./VireoFormAutocompleteField";

const source = (code: string, description?: string) => ({
  docs: {
    ...(description && { description: { story: description } }),
    source: { code, language: "tsx", type: "code" as const },
  },
});
const meta = {
  title: "Forms/Forms/Fields/VireoFormAutocompleteField",
  component: VireoFormAutocompleteField,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormAutocompleteField binds one searchable fixed-option scalar value to the current TanStack Form field through \`field.AutocompleteField\`.

### Why it exists

Searchable choices otherwise repeat option identity, async selected-value hydration, filtering, popup lifecycle, unresolved-value display, validation, and accessibility plumbing. Vireo centralizes those contracts while retaining MUI's familiar interaction and customization surface. Use it for one string- or number-valued option ID; use SelectField for short lists that do not need search.`,
      },
    },
  },
  argTypes: { slots: { control: false }, slotProps: { control: false }, classes: { control: false } },
  args: { label: null, options: [], getOptionValue: () => "", getOptionLabel: () => "" },
} satisfies Meta<typeof VireoFormAutocompleteField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <DefaultExample />, parameters: source(defaultSource) };
export const StatesAndInteractions: Story = {
  render: () => <StatesAndInteractionsExample />,
  parameters: source(statesAndInteractionsSource),
};
export const AsyncSelectedOptionHydration: Story = {
  render: () => <AsyncSelectedOptionHydrationExample />,
  parameters: source(asyncSelectedOptionHydrationSource),
};
export const ServerFilteringAndLoading: Story = {
  render: () => <ServerFilteringAndLoadingExample />,
  parameters: source(serverFilteringAndLoadingSource),
};
export const UnresolvedValue: Story = {
  render: () => <UnresolvedValueExample />,
  parameters: source(unresolvedValueSource),
};
export const GroupedOptions: Story = {
  render: () => <GroupedOptionsExample />,
  parameters: source(groupedOptionsSource),
};
export const ZodFieldValidation: Story = {
  render: () => <ZodFieldValidationExample />,
  parameters: source(zodFieldValidationSource),
};
export const ZodFormValidation: Story = {
  render: () => <ZodFormValidationExample />,
  parameters: source(zodFormValidationSource),
};
export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: source(customizedSlotsSource),
};
export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: source(themeCustomizationSource),
};
