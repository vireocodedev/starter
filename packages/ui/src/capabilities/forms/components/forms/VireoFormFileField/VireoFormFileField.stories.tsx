import DefaultExample from "@/capabilities/forms/components/forms/VireoFormFileField/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormFileField/internal/storybook/DefaultExample.tsx?raw";
import DisabledAndReadOnlyExample from "@/capabilities/forms/components/forms/VireoFormFileField/internal/storybook/DisabledAndReadOnlyExample";
import disabledAndReadOnlyExampleSource from "@/capabilities/forms/components/forms/VireoFormFileField/internal/storybook/DisabledAndReadOnlyExample.tsx?raw";
import DragAndDropExample from "@/capabilities/forms/components/forms/VireoFormFileField/internal/storybook/DragAndDropExample";
import dragAndDropExampleSource from "@/capabilities/forms/components/forms/VireoFormFileField/internal/storybook/DragAndDropExample.tsx?raw";
import ImagePreviewExample from "@/capabilities/forms/components/forms/VireoFormFileField/internal/storybook/ImagePreviewExample";
import imagePreviewExampleSource from "@/capabilities/forms/components/forms/VireoFormFileField/internal/storybook/ImagePreviewExample.tsx?raw";
import LongFilenameTruncationExample from "@/capabilities/forms/components/forms/VireoFormFileField/internal/storybook/LongFilenameTruncationExample";
import longFilenameTruncationExampleSource from "@/capabilities/forms/components/forms/VireoFormFileField/internal/storybook/LongFilenameTruncationExample.tsx?raw";
import TypeAndSizeRejectionsExample from "@/capabilities/forms/components/forms/VireoFormFileField/internal/storybook/TypeAndSizeRejectionsExample";
import typeAndSizeRejectionsExampleSource from "@/capabilities/forms/components/forms/VireoFormFileField/internal/storybook/TypeAndSizeRejectionsExample.tsx?raw";
import ZodFieldValidationExample from "@/capabilities/forms/components/forms/VireoFormFileField/internal/storybook/ZodFieldValidationExample";
import zodFieldValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormFileField/internal/storybook/ZodFieldValidationExample.tsx?raw";
import ZodFormValidationExample from "@/capabilities/forms/components/forms/VireoFormFileField/internal/storybook/ZodFormValidationExample";
import zodFormValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormFileField/internal/storybook/ZodFormValidationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormFileField } from "./VireoFormFileField";

function createSourceParameters(code: string, description?: string) {
  return {
    docs: {
      ...(description && { description: { story: description } }),
      source: { code, language: "tsx", type: "code" as const },
    },
  };
}

const meta = {
  title: "Forms/Forms/Fields/VireoFormFileField",
  component: VireoFormFileField,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormFileField binds a single browser \`File | null\` value to the current TanStack Form field through \`field.FileField\`.

### Why it exists

File fields otherwise repeat hidden-input wiring, choose and clear controls, drag-and-drop handling, accept and size rejection, filename truncation, metadata, accessibility, validation visibility, and optional preview placement. Vireo centralizes that browser-side selection contract without owning uploads or transport. Use it for one file; use a dedicated multiple-file field when order, per-file rejection, and collection management are required.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
    previewRenderer: { control: false },
    onFileRejected: { control: false },
  },
} satisfies Meta<typeof VireoFormFileField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const ImagePreview: Story = {
  render: () => <ImagePreviewExample />,
  parameters: createSourceParameters(
    imagePreviewExampleSource,
    "Opts into a dedicated second-row preview by passing VireoFileImagePreview as the renderer.",
  ),
};

export const DragAndDrop: Story = {
  render: () => <DragAndDropExample />,
  parameters: createSourceParameters(dragAndDropExampleSource),
};

export const TypeAndSizeRejections: Story = {
  render: () => <TypeAndSizeRejectionsExample />,
  parameters: createSourceParameters(
    typeAndSizeRejectionsExampleSource,
    "Rejects unsupported or oversized files locally while preserving the current form value.",
  ),
};

export const LongFilenameTruncation: Story = {
  render: () => <LongFilenameTruncationExample />,
  parameters: createSourceParameters(
    longFilenameTruncationExampleSource,
    "Middle-truncates a long stem against the actual container width while preserving the final extension.",
  ),
};

export const DisabledAndReadOnly: Story = {
  render: () => <DisabledAndReadOnlyExample />,
  parameters: createSourceParameters(disabledAndReadOnlyExampleSource),
};

export const ZodFieldValidation: Story = {
  render: () => <ZodFieldValidationExample />,
  parameters: createSourceParameters(
    zodFieldValidationExampleSource,
    "Attaches one required-PDF Zod schema directly to the file field.",
  ),
};

export const ZodFormValidation: Story = {
  render: () => <ZodFormValidationExample />,
  parameters: createSourceParameters(
    zodFormValidationExampleSource,
    "Routes text and file issues from one Zod object schema attached to useVireoForm.",
  ),
};
