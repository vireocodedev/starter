import CompactProgressExample from "@/capabilities/forms/components/forms/VireoFormStepProgress/internal/storybook/CompactProgressExample";
import compactProgressExampleSource from "@/capabilities/forms/components/forms/VireoFormStepProgress/internal/storybook/CompactProgressExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/forms/VireoFormStepProgress/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormStepProgress/internal/storybook/DefaultExample.tsx?raw";
import NavigationPoliciesExample from "@/capabilities/forms/components/forms/VireoFormStepProgress/internal/storybook/NavigationPoliciesExample";
import navigationPoliciesExampleSource from "@/capabilities/forms/components/forms/VireoFormStepProgress/internal/storybook/NavigationPoliciesExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormStepProgress } from "./VireoFormStepProgress";

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
  title: "UI/Capabilities/Forms/Multi-Step/VireoFormStepProgress",
  component: VireoFormStepProgress,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoFormStepProgress communicates the active, completed, visited, and invalid states of a bound multi-step form.

### Why it exists

Multi-step workflows need progress that stays synchronized with conditional steps, validation, direct navigation policy, localization, and narrow containers. Vireo owns that coordination and provides horizontal, compact, and container-responsive presentations; use it inside form.MultiStep rather than rebuilding progress from field state.`,
      },
    },
    controls: { disable: true },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoFormStepProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const CompactProgress: Story = {
  render: () => <CompactProgressExample />,
  parameters: createSourceParameters(compactProgressExampleSource),
};

export const NavigationPolicies: Story = {
  render: () => <NavigationPoliciesExample />,
  parameters: createSourceParameters(navigationPoliciesExampleSource),
};
