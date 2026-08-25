import CreationAndNormalizationExample from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteField/internal/storybook/CreationAndNormalizationExample";
import creationAndNormalizationSource from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteField/internal/storybook/CreationAndNormalizationExample.tsx?raw";
import CustomizedSlotsExample from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteField/internal/storybook/CustomizedSlotsExample";
import customizedSlotsSource from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteField/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteField/internal/storybook/DefaultExample";
import defaultSource from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteField/internal/storybook/DefaultExample.tsx?raw";
import ServerFilteringAndLoadingExample from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteField/internal/storybook/ServerFilteringAndLoadingExample";
import serverFilteringAndLoadingSource from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteField/internal/storybook/ServerFilteringAndLoadingExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteField/internal/storybook/ThemeCustomizationExample";
import themeCustomizationSource from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteField/internal/storybook/ThemeCustomizationExample.tsx?raw";
import ZodFieldValidationExample from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteField/internal/storybook/ZodFieldValidationExample";
import zodFieldValidationSource from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteField/internal/storybook/ZodFieldValidationExample.tsx?raw";
import ZodFormValidationExample from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteField/internal/storybook/ZodFormValidationExample";
import zodFormValidationSource from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteField/internal/storybook/ZodFormValidationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormFreeSoloAutocompleteField } from "./VireoFormFreeSoloAutocompleteField";

const source = (code: string) => ({ docs: { source: { code, language: "tsx" } } });
const meta = {
  title: "TypeScript/UI/Capabilities/Forms/Fields/VireoFormFreeSoloAutocompleteField",
  component: VireoFormFreeSoloAutocompleteField,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormFreeSoloAutocompleteField binds one known or user-created string to the current TanStack Form field through \`field.FreeSoloAutocompleteField\`.

### Why it exists

Free-solo fields otherwise repeat string normalization, create-option presentation, known-option resolution, filtering, validation visibility, and blur commit behavior. Vireo centralizes those contracts while keeping MUI's searchable popup and slots. Use it when one arbitrary string may be entered; use AutocompleteField when values must come from a fixed option set.`,
      },
    },
  },
  args: { label: null, options: [], getOptionValue: () => "", getOptionLabel: () => "" },
} satisfies Meta<typeof VireoFormFreeSoloAutocompleteField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { render: () => <DefaultExample />, parameters: source(defaultSource) };
export const CreationAndNormalization: Story = {
  render: () => <CreationAndNormalizationExample />,
  parameters: source(creationAndNormalizationSource),
};
export const ServerFilteringAndLoading: Story = {
  render: () => <ServerFilteringAndLoadingExample />,
  parameters: source(serverFilteringAndLoadingSource),
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
