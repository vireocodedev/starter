import BuiltInCodecsExample from "@/core/hooks/useVireoSearchParamState/internal/storybook/BuiltInCodecsExample";
import builtInCodecsExampleSource from "@/core/hooks/useVireoSearchParamState/internal/storybook/BuiltInCodecsExample.tsx?raw";
import CustomCodecExample from "@/core/hooks/useVireoSearchParamState/internal/storybook/CustomCodecExample";
import customCodecExampleSource from "@/core/hooks/useVireoSearchParamState/internal/storybook/CustomCodecExample.tsx?raw";
import DefaultStringExample from "@/core/hooks/useVireoSearchParamState/internal/storybook/DefaultStringExample";
import defaultStringExampleSource from "@/core/hooks/useVireoSearchParamState/internal/storybook/DefaultStringExample.tsx?raw";
import HistoryNavigationExample from "@/core/hooks/useVireoSearchParamState/internal/storybook/HistoryNavigationExample";
import historyNavigationExampleSource from "@/core/hooks/useVireoSearchParamState/internal/storybook/HistoryNavigationExample.tsx?raw";
import NullableStateExample from "@/core/hooks/useVireoSearchParamState/internal/storybook/NullableStateExample";
import nullableStateExampleSource from "@/core/hooks/useVireoSearchParamState/internal/storybook/NullableStateExample.tsx?raw";
import VireoTabsIntegrationExample from "@/core/hooks/useVireoSearchParamState/internal/storybook/VireoTabsIntegrationExample";
import vireoTabsIntegrationExampleSource from "@/core/hooks/useVireoSearchParamState/internal/storybook/VireoTabsIntegrationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "UI/Core/Hooks/useVireoSearchParamState",
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Synchronizes one typed scalar value with one URL search parameter through an explicit codec contract.\n\n### Why it exists\n\nFilters, tabs, pagination, and optional selections repeatedly need safe URL parsing, canonical serialization, browser-history synchronization, SSR behavior, and preservation of unrelated navigation state. Vireo owns that boundary without coupling controls to routing. Use it when one scalar UI state belongs in the URL; use application or router state when the value should not be shareable through navigation.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultStringState: Story = {
  render: () => <DefaultStringExample />,
  parameters: {
    ...source(defaultStringExampleSource),
    docs: {
      ...source(defaultStringExampleSource).docs,
      description: {
        story: "Uses the implicit string codec and removes the parameter when state returns to its default.",
      },
    },
  },
};

export const TabsIntegration: Story = {
  render: () => <VireoTabsIntegrationExample />,
  parameters: {
    ...source(vireoTabsIntegrationExampleSource),
    docs: {
      ...source(vireoTabsIntegrationExampleSource).docs,
      description: {
        story: "Composes URL state with controlled VireoTabs without adding navigation behavior to the component.",
      },
    },
  },
};

export const BuiltInCodecs: Story = {
  render: () => <BuiltInCodecsExample />,
  parameters: {
    ...source(builtInCodecsExampleSource),
    docs: {
      ...source(builtInCodecsExampleSource).docs,
      description: { story: "Uses the strict finite-number and lowercase-boolean codecs." },
    },
  },
};

export const NullableState: Story = {
  render: () => <NullableStateExample />,
  parameters: {
    ...source(nullableStateExampleSource),
    docs: {
      ...source(nullableStateExampleSource).docs,
      description: { story: "Represents parameter absence as null and removes the key when the selection is cleared." },
    },
  },
};

export const CustomCodec: Story = {
  render: () => <CustomCodecExample />,
  parameters: {
    ...source(customCodecExampleSource),
    docs: {
      ...source(customCodecExampleSource).docs,
      description: {
        story: "Constrains URL input to an application-defined string union with a small explicit codec.",
      },
    },
  },
};

export const HistoryNavigation: Story = {
  render: () => <HistoryNavigationExample />,
  parameters: {
    ...source(historyNavigationExampleSource),
    docs: {
      ...source(historyNavigationExampleSource).docs,
      description: { story: "Pushes meaningful state changes and follows browser back and forward navigation." },
    },
  },
};
