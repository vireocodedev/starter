import DefaultExample from "@/capabilities/forms/components/forms/VireoFormSectionItem/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormSectionItem/internal/storybook/DefaultExample.tsx?raw";
import FullRowExample from "@/capabilities/forms/components/forms/VireoFormSectionItem/internal/storybook/FullRowExample";
import fullRowExampleSource from "@/capabilities/forms/components/forms/VireoFormSectionItem/internal/storybook/FullRowExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormSectionItem } from "./VireoFormSectionItem";

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
  title: "Forms/Forms/VireoFormSectionItem",
  component: VireoFormSectionItem,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormSectionItem groups one or more elements into a single responsive form-section cell and can span the complete current row.

### Why it exists

Responsive form sections need an unambiguous way to keep related content together or make alerts, notes, and nested sections occupy the full row without exposing CSS Grid knowledge. Vireo owns that semantic escape hatch across every active column count. Use it for grouped or full-row section content; render ordinary fields directly when they occupy one cell.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
  args: { children: "Section content" },
} satisfies Meta<typeof VireoFormSectionItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const FullRow: Story = {
  render: () => <FullRowExample />,
  parameters: createSourceParameters(fullRowExampleSource),
};
