import ContainerResponsiveLayoutExample from "@/core/components/data-display/VireoLabelBox/internal/storybook/ContainerResponsiveLayoutExample";
import containerResponsiveLayoutExampleSource from "@/core/components/data-display/VireoLabelBox/internal/storybook/ContainerResponsiveLayoutExample.tsx?raw";
import DefaultExample from "@/core/components/data-display/VireoLabelBox/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/data-display/VireoLabelBox/internal/storybook/DefaultExample.tsx?raw";
import LabelAnatomyExample from "@/core/components/data-display/VireoLabelBox/internal/storybook/LabelAnatomyExample";
import labelAnatomyExampleSource from "@/core/components/data-display/VireoLabelBox/internal/storybook/LabelAnatomyExample.tsx?raw";
import LayoutDirectionsExample from "@/core/components/data-display/VireoLabelBox/internal/storybook/LayoutDirectionsExample";
import layoutDirectionsExampleSource from "@/core/components/data-display/VireoLabelBox/internal/storybook/LayoutDirectionsExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoLabelBox } from "./VireoLabelBox";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "UI/Core/Data Display/VireoLabelBox",
  component: VireoLabelBox,
  tags: ["autodocs"],
  args: { label: "Account name", children: null },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Provides consistent external label, helper-text, required-indicator, and content anatomy around controls or grouped content.\n\n### Why it exists\n\nComposite controls and grouped content cannot always use a control's built-in MUI label, which otherwise leads consumers to recreate spacing, required indicators, and helper-text placement. This component supplies that shared external-label contract. Prefer the underlying control's native label when it already provides the correct semantics and layout.",
      },
    },
  },
  argTypes: {
    children: { control: false },
    color: { control: false },
    fontWeight: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoLabelBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <DefaultExample />, parameters: source(defaultExampleSource) };
export const LabelAnatomy: Story = {
  render: () => <LabelAnatomyExample />,
  parameters: source(labelAnatomyExampleSource),
};
export const LayoutDirections: Story = {
  render: () => <LayoutDirectionsExample />,
  parameters: source(layoutDirectionsExampleSource),
};
export const ContainerResponsiveLayout: Story = {
  render: () => <ContainerResponsiveLayoutExample />,
  parameters: source(containerResponsiveLayoutExampleSource),
};
