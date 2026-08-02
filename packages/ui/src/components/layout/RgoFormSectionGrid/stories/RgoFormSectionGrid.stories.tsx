import { RgoFormSectionGrid } from "@/components/layout/RgoFormSectionGrid/RgoFormSectionGrid";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  RgoFormSectionGridWithDefaultPropsDemo,
  RgoFormSectionGridWithDefaultPropsDemoCode,
} from "./RgoFormSectionGridWithDefaultPropsDemo";
import {
  RgoFormSectionGridWithFormSectionDemo,
  RgoFormSectionGridWithFormSectionDemoCode,
} from "./RgoFormSectionGridWithFormSectionDemo";

const STORYBOOK_TITLE = "Components/Layout/RgoFormSectionGrid";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const DESCRIPTION =
  "A responsive grid layout wrapper for form fields using MUI Grid2. Provides consistent spacing between form fields arranged in a grid layout.";
const STORY_NAMES = ["With default props", "With form section"];

const meta: Meta<typeof RgoFormSectionGrid> = {
  title: STORYBOOK_TITLE,
  component: RgoFormSectionGrid,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: createStorybookDescription({
          badge: STORYBOOK_BADGE,
          description: DESCRIPTION,
          usage: RgoFormSectionGridWithDefaultPropsDemoCode,
          stories: createStories(STORY_NAMES),
        }),
      },
    },
  },
  argTypes: {
    children: {
      control: false,
      description: "Grid items (typically MUI Grid2 components wrapping form fields)",
      table: { type: { summary: "React.ReactNode" } },
    },
    rgoSlotProps: {
      control: false,
      description: "Slot props for customizing the root Grid container",
      table: { type: { summary: "RgoFormSectionGridSlotProps" } },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoFormSectionGridWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Responsive grid layout with form fields arranged in columns.",
      },
      source: {
        code: RgoFormSectionGridWithDefaultPropsDemoCode,
      },
    },
  },
};

export const WithFormSection: Story = {
  name: "With form section",
  render: () => <RgoFormSectionGridWithFormSectionDemo />,
  parameters: {
    docs: {
      description: {
        story: "Grid layout combined with RgoFormSection for a complete form layout with label and bordered container.",
      },
      source: {
        code: RgoFormSectionGridWithFormSectionDemoCode,
      },
    },
  },
};
