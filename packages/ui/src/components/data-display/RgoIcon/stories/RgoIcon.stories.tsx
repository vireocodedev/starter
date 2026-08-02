import { RgoIcon } from "@/components/data-display/RgoIcon/RgoIcon";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RgoIconWithCustomStylingDemo, RgoIconWithCustomStylingDemoCode } from "./RgoIconWithCustomStylingDemo";
import { RgoIconWithDefaultPropsDemo, RgoIconWithDefaultPropsDemoCode } from "./RgoIconWithDefaultPropsDemo";

const STORYBOOK_TITLE = "Components/Data display/RgoIcon";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const DESCRIPTION =
  "A typed icon component that renders icons from the application's icon registry. Icons are registered via `RgoIconsProvider` and the `RgoIconRegistry` interface augmentation pattern, ensuring type-safe icon names across the application.";
const STORY_NAMES = ["With default props", "With custom styling"];

const meta: Meta<typeof RgoIcon> = {
  title: STORYBOOK_TITLE,
  component: RgoIcon,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: createStorybookDescription({
          badge: STORYBOOK_BADGE,
          description: DESCRIPTION,
          usage: RgoIconWithDefaultPropsDemoCode,
          stories: createStories(STORY_NAMES),
        }),
      },
    },
  },
  argTypes: {
    icon: {
      control: false,
      description: "The name of the icon to render (must be registered in RgoIconRegistry)",
      table: { type: { summary: "RgoIconName" } },
    },
    width: {
      control: "number",
      description: "Icon width in pixels",
      table: { defaultValue: { summary: "24" }, type: { summary: "number" } },
    },
    height: {
      control: "number",
      description: "Icon height in pixels",
      table: { defaultValue: { summary: "24" }, type: { summary: "number" } },
    },
    stroke: {
      control: "color",
      description: "Stroke color",
      table: { defaultValue: { summary: '"currentColor"' }, type: { summary: "string" } },
    },
    fill: {
      control: "color",
      description: "Fill color",
      table: { defaultValue: { summary: '"none"' }, type: { summary: "string" } },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoIconWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Icons rendered from the registry. Each icon name is type-safe via the `RgoIconRegistry` augmentation.",
      },
      source: {
        code: RgoIconWithDefaultPropsDemoCode,
      },
    },
  },
};

export const WithCustomStyling: Story = {
  name: "With custom styling",
  render: () => <RgoIconWithCustomStylingDemo />,
  parameters: {
    docs: {
      description: {
        story: "Icons with custom sizes and colors via width/height props and MUI sx prop.",
      },
      source: {
        code: RgoIconWithCustomStylingDemoCode,
      },
    },
  },
};
