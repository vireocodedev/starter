import {
  UseRgoDownloadFnWithCsvStringDemo,
  UseRgoDownloadFnWithCsvStringDemoCode,
} from "@/hooks/useRgoDownloadFn/stories/UseRgoDownloadFnWithCsvStringDemo";
import {
  UseRgoDownloadFnWithCustomPresetDemo,
  UseRgoDownloadFnWithCustomPresetDemoCode,
} from "@/hooks/useRgoDownloadFn/stories/UseRgoDownloadFnWithCustomPresetDemo";
import {
  UseRgoDownloadFnWithXlsxBlobDemo,
  UseRgoDownloadFnWithXlsxBlobDemoCode,
} from "@/hooks/useRgoDownloadFn/stories/UseRgoDownloadFnWithXlsxBlobDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With CSV string", "With XLSX blob", "With custom preset"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "A custom React hook that turns a string, Blob, or ArrayBuffer into a browser file download. Built-in presets cover common formats (CSV, XLSX), and a custom preset object can be passed inline for any other MIME type. The hook handles MIME wrapping, extension appending, anchor click, and object URL cleanup.",
  stories: createStories(STORY_NAMES),
  usage: UseRgoDownloadFnWithCsvStringDemoCode,
});

const meta: Meta = {
  title: "Hooks/useRgoDownloadFn",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCsvString: Story = {
  name: "With CSV string",
  render: () => <UseRgoDownloadFnWithCsvStringDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Downloads an in-memory CSV string using the built-in `csv` preset. The hook wraps the string in a Blob and appends the `.csv` extension automatically.",
      },
      source: {
        code: UseRgoDownloadFnWithCsvStringDemoCode,
      },
    },
  },
};

export const WithXlsxBlob: Story = {
  name: "With XLSX blob",
  render: () => <UseRgoDownloadFnWithXlsxBlobDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Downloads a Blob using the built-in `xlsx` preset. When the Blob already has the matching MIME type it is reused directly, avoiding an unnecessary copy.",
      },
      source: {
        code: UseRgoDownloadFnWithXlsxBlobDemoCode,
      },
    },
  },
};

export const WithCustomPreset: Story = {
  name: "With custom preset",
  render: () => <UseRgoDownloadFnWithCustomPresetDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Downloads a JSON file by passing an inline preset object with `mimeType` and `extension`. Use this for formats not covered by the built-in presets.",
      },
      source: {
        code: UseRgoDownloadFnWithCustomPresetDemoCode,
      },
    },
  },
};
