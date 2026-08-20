import ActionableErrorExample from "@/core/components/feedback/VireoSnack/internal/storybook/ActionableErrorExample";
import actionableErrorExampleSource from "@/core/components/feedback/VireoSnack/internal/storybook/ActionableErrorExample.tsx?raw";
import DefaultExample from "@/core/components/feedback/VireoSnack/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/feedback/VireoSnack/internal/storybook/DefaultExample.tsx?raw";
import SemanticVariantsExample from "@/core/components/feedback/VireoSnack/internal/storybook/SemanticVariantsExample";
import semanticVariantsExampleSource from "@/core/components/feedback/VireoSnack/internal/storybook/SemanticVariantsExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { VireoSnack } from "./VireoSnack";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "Core/Feedback/VireoSnack",
  component: VireoSnack,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `Presents a compact semantic notification message with optional leading and trailing actions.

### Why it exists

Notifications repeatedly need the same semantic urgency, palette treatment, spacing, and adornment anatomy. Vireo owns that content surface so delivery systems can remain interchangeable. Use it inside toast or inline-feedback workflows; use Alert when the message belongs persistently in page content.`,
      },
    },
  },
  args: { message: "Changes saved" },
  argTypes: {
    message: { control: false },
    startAdornment: { control: false },
    endAdornment: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoSnack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <DefaultExample />, parameters: source(defaultExampleSource) };
export const SemanticVariants: Story = {
  render: () => <SemanticVariantsExample />,
  parameters: source(semanticVariantsExampleSource),
};
export const ActionableError: Story = {
  render: () => <ActionableErrorExample />,
  parameters: source(actionableErrorExampleSource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Retry upload" }));
    await expect(canvas.getByRole("alert")).toHaveTextContent("Retry requested");
  },
};
