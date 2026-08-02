import { RgoIconContainer } from "@/components/data-display/RgoIconContainer/RgoIconContainer";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  RgoIconContainerWithDefaultPropsDemo,
  RgoIconContainerWithDefaultPropsDemoCode,
} from "./RgoIconContainerWithDefaultPropsDemo";

const STORYBOOK_TITLE = "Components/Data display/RgoIconContainer";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const DESCRIPTION =
  "An SVG scaling utility component that normalizes icons of arbitrary viewBox dimensions to a standard 24×24 size. Wraps child SVG elements in a `<g>` with a calculated scale transform.";
const STORY_NAMES = ["With default props"];

const meta: Meta<typeof RgoIconContainer> = {
  title: STORYBOOK_TITLE,
  component: RgoIconContainer,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: createStorybookDescription({
          badge: STORYBOOK_BADGE,
          description: DESCRIPTION,
          usage: RgoIconContainerWithDefaultPropsDemoCode,
          stories: createStories(STORY_NAMES),
        }),
      },
    },
  },
  argTypes: {
    viewBoxWidth: {
      control: "number",
      description: "The original width of the SVG's viewBox",
      table: { type: { summary: "number" } },
    },
    viewBoxHeight: {
      control: "number",
      description: "The original height of the SVG's viewBox",
      table: { type: { summary: "number" } },
    },
    children: {
      control: false,
      description: "The SVG elements to be scaled",
      table: { type: { summary: "React.ReactNode" } },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoIconContainerWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates scaling SVG content from different viewBox sizes (16×16 and 32×32) to the standard 24×24 viewBox.",
      },
      source: {
        code: RgoIconContainerWithDefaultPropsDemoCode,
      },
    },
  },
};
