import { RgoPdfFrame } from "@/components/data-display/RgoPdfFrame/RgoPdfFrame";
import {
  RgoPdfFrameWithDefaultPropsDemo,
  RgoPdfFrameWithDefaultPropsDemoCode,
} from "@/components/data-display/RgoPdfFrame/stories/RgoPdfFrameWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "Thin PDF preview frame using the browser's native PDF viewer. Has **no** runtime dependency on `@react-pdf/renderer` — callers pass the resolved `url` (e.g. `instance.url`) and `loading` separately, so any PDF source works. Pass `null`/`undefined` for `url` while a PDF is still generating to keep the loader on screen without rendering an empty iframe.",
  stories: createStories(STORY_NAMES),
  usage: RgoPdfFrameWithDefaultPropsDemoCode,
});

const meta: Meta<typeof RgoPdfFrame> = {
  title: "Components/Data display/RgoPdfFrame",
  component: RgoPdfFrame,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: { component: DESCRIPTION },
    },
  },
  argTypes: {
    url: {
      control: "text",
      description: "PDF URL. `null`/`undefined` keeps the loader visible.",
      table: { type: { summary: "string | null | undefined" } },
    },
    loading: {
      control: "boolean",
      description: "Force the loader on (overrides URL-derived state).",
      table: { defaultValue: { summary: "false" } },
    },
    zoomPct: {
      control: "number",
      description: "Browser-native PDF viewer zoom (PDF Open Parameter).",
      table: { defaultValue: { summary: "100" } },
    },
    hideToolbar: {
      control: "boolean",
      description: "Hide the browser-native PDF toolbar (PDF Open Parameter).",
      table: { defaultValue: { summary: "false" } },
    },
    width: { control: "text", table: { defaultValue: { summary: '"100%"' } } },
    height: { control: "text", table: { defaultValue: { summary: '"70svh"' } } },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoPdfFrameWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Loads a sample PDF in the browser-native viewer; toggles for the loader overlay and the toolbar are above the frame.",
      },
      source: { code: RgoPdfFrameWithDefaultPropsDemoCode },
    },
  },
};
