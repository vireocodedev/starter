import CustomizedSlotExample from "@/core/components/behavior/VireoDelayedRender/internal/storybook/CustomizedSlotExample";
import customizedSlotExampleSource from "@/core/components/behavior/VireoDelayedRender/internal/storybook/CustomizedSlotExample.tsx?raw";
import DefaultExample from "@/core/components/behavior/VireoDelayedRender/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/behavior/VireoDelayedRender/internal/storybook/DefaultExample.tsx?raw";
import ImmediateExample from "@/core/components/behavior/VireoDelayedRender/internal/storybook/ImmediateExample";
import immediateExampleSource from "@/core/components/behavior/VireoDelayedRender/internal/storybook/ImmediateExample.tsx?raw";
import MultipleChildrenExample from "@/core/components/behavior/VireoDelayedRender/internal/storybook/MultipleChildrenExample";
import multipleChildrenExampleSource from "@/core/components/behavior/VireoDelayedRender/internal/storybook/MultipleChildrenExample.tsx?raw";
import RestartableExample from "@/core/components/behavior/VireoDelayedRender/internal/storybook/RestartableExample";
import restartableExampleSource from "@/core/components/behavior/VireoDelayedRender/internal/storybook/RestartableExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/behavior/VireoDelayedRender/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/behavior/VireoDelayedRender/internal/storybook/ThemeCustomizationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoDelayedRender } from "./VireoDelayedRender";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "Core/Behavior/VireoDelayedRender",
  component: VireoDelayedRender,
  tags: ["autodocs"],
  args: { children: null },
  parameters: {
    docs: {
      description: {
        component:
          "Defers mounting transient fallback content until an operation outlasts a short buffer.\n\n### Why it exists\n\nImmediately rendering a skeleton or loader can produce a distracting flash when an operation completes quickly. This component applies one consistent delay and cleanup lifecycle so fallback content appears only when it remains useful. Use it for transient loading feedback, not for intentionally staged content or entrance animation.",
      },
    },
  },
  argTypes: {
    children: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoDelayedRender>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ delay }) => <DefaultExample delay={delay} />,
  parameters: source(defaultExampleSource),
};

export const Immediate: Story = {
  args: { delay: 0 },
  render: () => <ImmediateExample />,
  parameters: source(immediateExampleSource),
};

export const Restartable: Story = {
  args: { delay: 1200 },
  render: ({ delay }) => <RestartableExample delay={delay} />,
  parameters: source(restartableExampleSource),
};

export const MultipleChildren: Story = {
  render: ({ delay }) => <MultipleChildrenExample delay={delay} />,
  parameters: source(multipleChildrenExampleSource),
};

export const CustomizedSlot: Story = {
  render: ({ delay }) => <CustomizedSlotExample delay={delay} />,
  parameters: source(customizedSlotExampleSource),
};

export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: source(themeCustomizationExampleSource),
};
