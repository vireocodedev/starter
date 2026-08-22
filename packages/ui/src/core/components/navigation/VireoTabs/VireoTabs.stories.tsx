import ControlledSelectionExample from "@/core/components/navigation/VireoTabs/internal/storybook/ControlledSelectionExample";
import controlledSelectionExampleSource from "@/core/components/navigation/VireoTabs/internal/storybook/ControlledSelectionExample.tsx?raw";
import DefaultExample from "@/core/components/navigation/VireoTabs/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/navigation/VireoTabs/internal/storybook/DefaultExample.tsx?raw";
import DisabledTabExample from "@/core/components/navigation/VireoTabs/internal/storybook/DisabledTabExample";
import disabledTabExampleSource from "@/core/components/navigation/VireoTabs/internal/storybook/DisabledTabExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { VireoTabs } from "./VireoTabs";

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
  title: "UI/Core/Navigation/VireoTabs",
  component: VireoTabs,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `Presents a labelled set of mutually exclusive content panels with accessible keyboard navigation.

### Why it exists

Settings and detail surfaces repeatedly need the same tab-to-panel relationships, selection state, keyboard behavior, and theme hooks. Vireo owns that complete navigation contract. Use it for a small set of peer views in one context; use links or routes when each destination needs its own URL or navigation history.`,
      },
    },
  },
  args: { tabs: [] },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onChange: fn() },
  render: ({ onChange }) => <DefaultExample onChange={onChange} />,
  parameters: createSourceParameters(defaultExampleSource),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Security" }));
    await expect(args.onChange).toHaveBeenLastCalledWith("security", expect.anything());
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Password and authentication settings");
  },
};

export const DisabledTab: Story = {
  render: () => <DisabledTabExample />,
  parameters: createSourceParameters(disabledTabExampleSource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("tab", { name: "Audit log" })).toBeDisabled();
  },
};

export const ControlledSelection: Story = {
  render: () => <ControlledSelectionExample />,
  parameters: createSourceParameters(controlledSelectionExampleSource),
};
