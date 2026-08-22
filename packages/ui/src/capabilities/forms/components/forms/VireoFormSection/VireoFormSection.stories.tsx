import ContainerResponsiveColumnsExample from "@/capabilities/forms/components/forms/VireoFormSection/internal/storybook/ContainerResponsiveColumnsExample";
import containerResponsiveColumnsExampleSource from "@/capabilities/forms/components/forms/VireoFormSection/internal/storybook/ContainerResponsiveColumnsExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/forms/VireoFormSection/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormSection/internal/storybook/DefaultExample.tsx?raw";
import PlainStackExample from "@/capabilities/forms/components/forms/VireoFormSection/internal/storybook/PlainStackExample";
import plainStackExampleSource from "@/capabilities/forms/components/forms/VireoFormSection/internal/storybook/PlainStackExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormSection } from "./VireoFormSection";

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
  title: "Capabilities/Forms/VireoFormSection",
  component: VireoFormSection,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `Groups related form controls under a required accessible heading and a container-responsive layout.

### Why it exists

Complex forms repeatedly need a clear hierarchy, a labelled group relationship, and shared spacing and surface treatment around related controls. The forms capability owns that composition. Use it for meaningful groups within a form; avoid it for a single field or purely decorative cards.`,
      },
    },
  },
  args: { children: "Form controls", label: "Form section" },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const PlainStack: Story = {
  render: () => <PlainStackExample />,
  parameters: createSourceParameters(plainStackExampleSource),
};

export const ContainerResponsiveColumns: Story = {
  render: () => <ContainerResponsiveColumnsExample />,
  parameters: createSourceParameters(containerResponsiveColumnsExampleSource),
};
