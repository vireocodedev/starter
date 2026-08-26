import AsyncAndUnresolvedSelectionsExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/AsyncAndUnresolvedSelectionsExample";
import asyncAndUnresolvedSelectionsSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/AsyncAndUnresolvedSelectionsExample.tsx?raw";
import CompactSelectedOptionsExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/CompactSelectedOptionsExample";
import compactSelectedOptionsSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/CompactSelectedOptionsExample.tsx?raw";
import CustomizedSlotsExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/CustomizedSlotsExample";
import customizedSlotsSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/CustomizedSlotsExample.tsx?raw";
import CustomSelectedOptionsRendererExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/CustomSelectedOptionsRendererExample";
import customSelectedOptionsRendererSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/CustomSelectedOptionsRendererExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/DefaultExample";
import defaultSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/DefaultExample.tsx?raw";
import GroupedOptionsExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/GroupedOptionsExample";
import groupedOptionsSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/GroupedOptionsExample.tsx?raw";
import LoadingExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/LoadingExample";
import loadingSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/LoadingExample.tsx?raw";
import MaximumSelectedOptionsExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/MaximumSelectedOptionsExample";
import maximumSelectedOptionsSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/MaximumSelectedOptionsExample.tsx?raw";
import StatesAndInteractionsExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/StatesAndInteractionsExample";
import statesAndInteractionsSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/StatesAndInteractionsExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/ThemeCustomizationExample";
import themeCustomizationSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/ThemeCustomizationExample.tsx?raw";
import ZodFieldValidationExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/ZodFieldValidationExample";
import zodFieldValidationSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/ZodFieldValidationExample.tsx?raw";
import ZodFormValidationExample from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/ZodFormValidationExample";
import zodFormValidationSource from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/internal/storybook/ZodFormValidationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormAutocompleteMultipleField } from "./VireoFormAutocompleteMultipleField";
const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });
const meta = {
  title: "TypeScript/UI/Capabilities/Forms/Fields/VireoFormAutocompleteMultipleField",
  component: VireoFormAutocompleteMultipleField,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormAutocompleteMultipleField binds an ordered array of searchable fixed-option scalar values through \`field.AutocompleteMultipleField\`.

### Why it exists

Multiple searchable choices add collection ordering, duplicate prevention, compact selected-value presentation, async hydration, unresolved references, selection limits, and per-option removal to ordinary autocomplete plumbing. Vireo owns that complete contract so consumers store stable scalar arrays rather than UI option objects.`,
      },
    },
  },
  argTypes: { slots: { control: false }, slotProps: { control: false }, classes: { control: false } },
  args: { label: null, options: [], getOptionValue: () => "", getOptionLabel: () => "" },
} satisfies Meta<typeof VireoFormAutocompleteMultipleField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { render: () => <DefaultExample />, parameters: source(defaultSource) };
export const Loading: Story = { render: () => <LoadingExample />, parameters: source(loadingSource) };
export const StatesAndInteractions: Story = {
  render: () => <StatesAndInteractionsExample />,
  parameters: source(statesAndInteractionsSource),
};
export const CompactSelectedOptions: Story = {
  render: () => <CompactSelectedOptionsExample />,
  parameters: source(compactSelectedOptionsSource),
};
export const MaximumSelectedOptions: Story = {
  render: () => <MaximumSelectedOptionsExample />,
  parameters: source(maximumSelectedOptionsSource),
};
export const AsyncAndUnresolvedSelections: Story = {
  render: () => <AsyncAndUnresolvedSelectionsExample />,
  parameters: source(asyncAndUnresolvedSelectionsSource),
};
export const CustomSelectedOptionsRenderer: Story = {
  render: () => <CustomSelectedOptionsRendererExample />,
  parameters: source(customSelectedOptionsRendererSource),
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
