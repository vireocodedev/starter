import CompactContainerLayoutExample from "@/capabilities/application-preferences/components/layout/VireoPreferencePanel/internal/storybook/CompactContainerLayoutExample";
import compactContainerLayoutExampleSource from "@/capabilities/application-preferences/components/layout/VireoPreferencePanel/internal/storybook/CompactContainerLayoutExample.tsx?raw";
import ControlledExpansionExample from "@/capabilities/application-preferences/components/layout/VireoPreferencePanel/internal/storybook/ControlledExpansionExample";
import controlledExpansionExampleSource from "@/capabilities/application-preferences/components/layout/VireoPreferencePanel/internal/storybook/ControlledExpansionExample.tsx?raw";
import CustomizedSlotsExample from "@/capabilities/application-preferences/components/layout/VireoPreferencePanel/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/capabilities/application-preferences/components/layout/VireoPreferencePanel/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/application-preferences/components/layout/VireoPreferencePanel/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/application-preferences/components/layout/VireoPreferencePanel/internal/storybook/DefaultExample.tsx?raw";
import EmptyStateExample from "@/capabilities/application-preferences/components/layout/VireoPreferencePanel/internal/storybook/EmptyStateExample";
import emptyStateExampleSource from "@/capabilities/application-preferences/components/layout/VireoPreferencePanel/internal/storybook/EmptyStateExample.tsx?raw";
import SearchAndAutomaticExpansionExample from "@/capabilities/application-preferences/components/layout/VireoPreferencePanel/internal/storybook/SearchAndAutomaticExpansionExample";
import searchAndAutomaticExpansionExampleSource from "@/capabilities/application-preferences/components/layout/VireoPreferencePanel/internal/storybook/SearchAndAutomaticExpansionExample.tsx?raw";
import SectionActionsExample from "@/capabilities/application-preferences/components/layout/VireoPreferencePanel/internal/storybook/SectionActionsExample";
import sectionActionsExampleSource from "@/capabilities/application-preferences/components/layout/VireoPreferencePanel/internal/storybook/SectionActionsExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/application-preferences/components/layout/VireoPreferencePanel/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/capabilities/application-preferences/components/layout/VireoPreferencePanel/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoPreferencePanel } from "./VireoPreferencePanel";

function createSourceParameters(code: string) {
  return { docs: { source: { code, language: "tsx", type: "code" as const } } };
}

const meta = {
  title: "TypeScript/UI/Capabilities/Application Preferences/VireoPreferencePanel",
  component: VireoPreferencePanel,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoPreferencePanel presents application-owned preference controls in searchable, responsive sections.

### Why it exists

Application settings repeatedly need the same section disclosure, filtering, control alignment, compact layout, and sticky-header behavior. Vireo owns that presentation while consumers keep preference values, persistence, defaults, permissions, and reset behavior. Use it for reusable preference surfaces; use ordinary layout primitives for unrelated forms or workflow-specific controls.`,
      },
    },
  },
} satisfies Meta<typeof VireoPreferencePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { sections: [], emptyState: null },
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const SearchAndAutomaticExpansion: Story = {
  args: { sections: [], emptyState: null },
  render: () => <SearchAndAutomaticExpansionExample />,
  parameters: createSourceParameters(searchAndAutomaticExpansionExampleSource),
};

export const ControlledExpansion: Story = {
  args: { sections: [], emptyState: null },
  render: () => <ControlledExpansionExample />,
  parameters: createSourceParameters(controlledExpansionExampleSource),
};

export const CompactContainerLayout: Story = {
  args: { sections: [], emptyState: null },
  render: () => <CompactContainerLayoutExample />,
  parameters: createSourceParameters(compactContainerLayoutExampleSource),
};

export const SectionActions: Story = {
  args: { sections: [], emptyState: null },
  render: () => <SectionActionsExample />,
  parameters: createSourceParameters(sectionActionsExampleSource),
};

export const EmptyState: Story = {
  args: { sections: [], emptyState: null },
  render: () => <EmptyStateExample />,
  parameters: createSourceParameters(emptyStateExampleSource),
};

export const CustomizedSlots: Story = {
  args: { sections: [], emptyState: null },
  render: () => <CustomizedSlotsExample />,
  parameters: createSourceParameters(customizedSlotsExampleSource),
};

export const ThemeCustomization: Story = {
  args: { sections: [], emptyState: null },
  render: () => <ThemeCustomizationExample />,
  parameters: createSourceParameters(themeCustomizationExampleSource),
};
