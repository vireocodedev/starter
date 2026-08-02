import { RgoFormSection } from "@/components/layout/RgoFormSection/RgoFormSection";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  RgoFormSectionWithCustomStylingDemo,
  RgoFormSectionWithCustomStylingDemoCode,
} from "./RgoFormSectionWithCustomStylingDemo";
import {
  RgoFormSectionWithDefaultPropsDemo,
  RgoFormSectionWithDefaultPropsDemoCode,
} from "./RgoFormSectionWithDefaultPropsDemo";
import { RgoFormSectionWithLabelDemo, RgoFormSectionWithLabelDemoCode } from "./RgoFormSectionWithLabelDemo";

const STORYBOOK_TITLE = "Components/Layout/RgoFormSection";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const DESCRIPTION =
  "A form section wrapper that groups form fields inside a bordered container with optional label. Provides consistent spacing and styling for form layouts.";
const STORY_NAMES = ["With default props", "With label", "With custom styling"];

const meta: Meta<typeof RgoFormSection> = {
  title: STORYBOOK_TITLE,
  component: RgoFormSection,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: createStorybookDescription({
          badge: STORYBOOK_BADGE,
          description: DESCRIPTION,
          usage: RgoFormSectionWithDefaultPropsDemoCode,
          stories: createStories(STORY_NAMES),
        }),
      },
    },
  },
  argTypes: {
    children: {
      control: false,
      description: "Form fields or content to render inside the section",
      table: { type: { summary: "React.ReactNode" } },
    },
    label: {
      control: "text",
      description: "Optional section label displayed above the content area",
      table: { type: { summary: "string" } },
    },
    rgoSlotProps: {
      control: false,
      description: "Slot props for customizing root, label, and content elements",
      table: { type: { summary: "RgoFormSectionSlotProps" } },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoFormSectionWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Form section with default props, grouping fields in a bordered container.",
      },
      source: {
        code: RgoFormSectionWithDefaultPropsDemoCode,
      },
    },
  },
};

export const WithLabel: Story = {
  name: "With label",
  render: () => <RgoFormSectionWithLabelDemo />,
  parameters: {
    docs: {
      description: {
        story: "Form section with a label displayed above the content area.",
      },
      source: {
        code: RgoFormSectionWithLabelDemoCode,
      },
    },
  },
};

export const WithCustomStyling: Story = {
  name: "With custom styling",
  render: () => <RgoFormSectionWithCustomStylingDemo />,
  parameters: {
    docs: {
      description: {
        story: "Form section with custom styling via rgoSlotProps for root, label, and content.",
      },
      source: {
        code: RgoFormSectionWithCustomStylingDemoCode,
      },
    },
  },
};
