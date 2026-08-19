import CustomizedSlotsExample from "@/capabilities/forms/components/forms/VireoForm/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/capabilities/forms/components/forms/VireoForm/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/forms/VireoForm/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoForm/internal/storybook/DefaultExample.tsx?raw";
import ThemeCustomizationExample from "@/capabilities/forms/components/forms/VireoForm/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/capabilities/forms/components/forms/VireoForm/internal/storybook/ThemeCustomizationExample.tsx?raw";
import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { VireoFormProps } from "./VireoForm.types";

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

function VireoFormStory(props: VireoFormProps) {
  const form = useVireoForm({ defaultValues: {} });
  return <form.Form {...props} />;
}

const meta = {
  title: "Forms/Forms/VireoForm",
  component: VireoFormStory,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `Provides Vireo's semantic form boundary, native lifecycle wiring, shared field presentation policy, and unsaved-change integration.

### Why it exists

TanStack Form deliberately leaves rendering and application conventions to consumers. Vireo owns the recurring form-root plumbing so every form gets consistent submission, reset, invalid-field focus, theming, and optional unsaved-change behavior without hiding TanStack's native API. Obtain it from \`useVireoForm\` as \`form.Form\`; use a plain native form when none of these shared contracts are needed.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: createSourceParameters(customizedSlotsExampleSource),
};

export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: createSourceParameters(themeCustomizationExampleSource),
};
