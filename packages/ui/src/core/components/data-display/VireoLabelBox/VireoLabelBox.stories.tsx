import CustomizedSlotsExample from "@/core/components/data-display/VireoLabelBox/internal/storybook/CustomizedSlotsExample";
import customizedSlotsExampleSource from "@/core/components/data-display/VireoLabelBox/internal/storybook/CustomizedSlotsExample.tsx?raw";
import DefaultExample from "@/core/components/data-display/VireoLabelBox/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/data-display/VireoLabelBox/internal/storybook/DefaultExample.tsx?raw";
import MobileWidthRowWithHelperTextExample from "@/core/components/data-display/VireoLabelBox/internal/storybook/MobileWidthRowWithHelperTextExample";
import mobileWidthRowWithHelperTextExampleSource from "@/core/components/data-display/VireoLabelBox/internal/storybook/MobileWidthRowWithHelperTextExample.tsx?raw";
import MobileWidthWithHelperTextExample from "@/core/components/data-display/VireoLabelBox/internal/storybook/MobileWidthWithHelperTextExample";
import mobileWidthWithHelperTextExampleSource from "@/core/components/data-display/VireoLabelBox/internal/storybook/MobileWidthWithHelperTextExample.tsx?raw";
import RequiredExample from "@/core/components/data-display/VireoLabelBox/internal/storybook/RequiredExample";
import requiredExampleSource from "@/core/components/data-display/VireoLabelBox/internal/storybook/RequiredExample.tsx?raw";
import RowDirectionExample from "@/core/components/data-display/VireoLabelBox/internal/storybook/RowDirectionExample";
import rowDirectionExampleSource from "@/core/components/data-display/VireoLabelBox/internal/storybook/RowDirectionExample.tsx?raw";
import ThemeAwareColorExample from "@/core/components/data-display/VireoLabelBox/internal/storybook/ThemeAwareColorExample";
import themeAwareColorExampleSource from "@/core/components/data-display/VireoLabelBox/internal/storybook/ThemeAwareColorExample.tsx?raw";
import ThemeCustomizationExample from "@/core/components/data-display/VireoLabelBox/internal/storybook/ThemeCustomizationExample";
import themeCustomizationExampleSource from "@/core/components/data-display/VireoLabelBox/internal/storybook/ThemeCustomizationExample.tsx?raw";
import WithHelperTextExample from "@/core/components/data-display/VireoLabelBox/internal/storybook/WithHelperTextExample";
import withHelperTextExampleSource from "@/core/components/data-display/VireoLabelBox/internal/storybook/WithHelperTextExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoLabelBox } from "./VireoLabelBox";

const source = (code: string) => ({ docs: { source: { code, language: "tsx", type: "code" as const } } });

const meta = {
  title: "Core/Data Display/VireoLabelBox",
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
export const WithHelperText: Story = {
  render: () => <WithHelperTextExample />,
  parameters: source(withHelperTextExampleSource),
};
export const MobileWidthWithHelperText: Story = {
  render: () => <MobileWidthWithHelperTextExample />,
  parameters: source(mobileWidthWithHelperTextExampleSource),
};
export const Required: Story = { render: () => <RequiredExample />, parameters: source(requiredExampleSource) };
export const RowDirection: Story = {
  render: () => <RowDirectionExample />,
  parameters: source(rowDirectionExampleSource),
};
export const MobileWidthRowWithHelperText: Story = {
  render: () => <MobileWidthRowWithHelperTextExample />,
  parameters: source(mobileWidthRowWithHelperTextExampleSource),
};
export const ThemeAwareColor: Story = {
  render: () => <ThemeAwareColorExample />,
  parameters: source(themeAwareColorExampleSource),
};
export const CustomizedSlots: Story = {
  render: () => <CustomizedSlotsExample />,
  parameters: source(customizedSlotsExampleSource),
};
export const ThemeCustomization: Story = {
  render: () => <ThemeCustomizationExample />,
  parameters: source(themeCustomizationExampleSource),
};
