import CreationAndLimitsExample from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteMultipleField/internal/storybook/CreationAndLimitsExample";
import creationAndLimitsSource from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteMultipleField/internal/storybook/CreationAndLimitsExample.tsx?raw";
import CustomSelectedOptionsRendererExample from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteMultipleField/internal/storybook/CustomSelectedOptionsRendererExample";
import customSelectedOptionsRendererSource from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteMultipleField/internal/storybook/CustomSelectedOptionsRendererExample.tsx?raw";
import CustomizedSlotsExample from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteMultipleField/internal/storybook/CustomizedSlotsExample";
import customizedSlotsSource from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteMultipleField/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteMultipleField/internal/storybook/DefaultExample";
import defaultSource from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteMultipleField/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteMultipleField/internal/storybook/ThemeCustomizationExample";
import themeCustomizationSource from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteMultipleField/internal/storybook/ThemeCustomizationExample.tsx?raw";
import ZodFieldValidationExample from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteMultipleField/internal/storybook/ZodFieldValidationExample";
import zodFieldValidationSource from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteMultipleField/internal/storybook/ZodFieldValidationExample.tsx?raw";
import ZodFormValidationExample from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteMultipleField/internal/storybook/ZodFormValidationExample";
import zodFormValidationSource from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteMultipleField/internal/storybook/ZodFormValidationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormFreeSoloAutocompleteMultipleField } from "./VireoFormFreeSoloAutocompleteMultipleField";

const source = (code: string) => ({ docs: { source: { code, language: "tsx" } } });
const meta = {
  title: "UI/Capabilities/Forms/Fields/VireoFormFreeSoloAutocompleteMultipleField",
  component: VireoFormFreeSoloAutocompleteMultipleField,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormFreeSoloAutocompleteMultipleField binds an ordered collection of known or user-created strings through \`field.FreeSoloAutocompleteMultipleField\`.

### Why it exists

Multi-value free-solo fields otherwise repeat normalization, duplicate prevention, compact chip presentation, selection limits, custom-value creation, validation, and accessible removal behavior. Vireo centralizes that policy while preserving MUI slots and filtering. Use it for arbitrary string collections; use AutocompleteMultipleField when every value must resolve to a fixed option ID.`,
      },
    },
  },
  args: { label: null, options: [], getOptionValue: () => "", getOptionLabel: () => "" },
} satisfies Meta<typeof VireoFormFreeSoloAutocompleteMultipleField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { render: () => <DefaultExample />, parameters: source(defaultSource) };
export const CreationAndLimits: Story = {
  render: () => <CreationAndLimitsExample />,
  parameters: source(creationAndLimitsSource),
};
export const CustomSelectedOptionsRenderer: Story = {
  render: () => <CustomSelectedOptionsRendererExample />,
  parameters: source(customSelectedOptionsRendererSource),
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
