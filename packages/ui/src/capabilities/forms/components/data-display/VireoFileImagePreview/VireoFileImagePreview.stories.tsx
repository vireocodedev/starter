import DefaultExample from "@/capabilities/forms/components/data-display/VireoFileImagePreview/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/data-display/VireoFileImagePreview/internal/storybook/DefaultExample.tsx?raw";
import ObjectFitModesExample from "@/capabilities/forms/components/data-display/VireoFileImagePreview/internal/storybook/ObjectFitModesExample";
import objectFitModesExampleSource from "@/capabilities/forms/components/data-display/VireoFileImagePreview/internal/storybook/ObjectFitModesExample.tsx?raw";
import UnavailablePreviewExample from "@/capabilities/forms/components/data-display/VireoFileImagePreview/internal/storybook/UnavailablePreviewExample";
import unavailablePreviewExampleSource from "@/capabilities/forms/components/data-display/VireoFileImagePreview/internal/storybook/UnavailablePreviewExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFileImagePreview } from "./VireoFileImagePreview";

const placeholderFile = new File([], "placeholder.png", { type: "image/png" });

function createSourceParameters(code: string, description?: string) {
  return {
    docs: {
      ...(description && { description: { story: description } }),
      source: { code, language: "tsx", type: "code" as const },
    },
  };
}

const meta = {
  title: "UI/Capabilities/Forms/VireoFileImagePreview",
  component: VireoFileImagePreview,
  tags: ["autodocs"],
  args: { file: placeholderFile },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFileImagePreview renders an opt-in, object-URL-backed preview for a browser image File.

### Why it exists

File inputs often need an image preview, but repeatedly managing object URL creation, cleanup, decode failure, sizing, and accessible alternative text is error-prone. Vireo owns that lifecycle while leaving preview use explicit. Use it directly or pass it to \`field.FileField\` as \`previewRenderer\`; use a domain-specific renderer for documents, media, or richer previews.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
    file: { control: false },
  },
} satisfies Meta<typeof VireoFileImagePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const ObjectFitModes: Story = {
  render: () => <ObjectFitModesExample />,
  parameters: createSourceParameters(
    objectFitModesExampleSource,
    "Compare the complete-image and edge-to-edge presentation modes inside the same fixed preview area.",
  ),
};

export const UnavailablePreview: Story = {
  render: () => <UnavailablePreviewExample />,
  parameters: createSourceParameters(
    unavailablePreviewExampleSource,
    "Non-image files get a stable fallback instead of an attempted browser preview.",
  ),
};
