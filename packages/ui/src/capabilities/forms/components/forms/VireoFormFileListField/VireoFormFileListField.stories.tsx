import AppendingFilesExample from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/AppendingFilesExample";
import appendingFilesExampleSource from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/AppendingFilesExample.tsx?raw";
import CapacityReachedExample from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/CapacityReachedExample";
import capacityReachedExampleSource from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/CapacityReachedExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/DefaultExample.tsx?raw";
import DisabledAndReadOnlyExample from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/DisabledAndReadOnlyExample";
import disabledAndReadOnlyExampleSource from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/DisabledAndReadOnlyExample.tsx?raw";
import DragAndDropExample from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/DragAndDropExample";
import dragAndDropExampleSource from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/DragAndDropExample.tsx?raw";
import ImagePreviewsExample from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/ImagePreviewsExample";
import imagePreviewsExampleSource from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/ImagePreviewsExample.tsx?raw";
import LongFilenameTruncationExample from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/LongFilenameTruncationExample";
import longFilenameTruncationExampleSource from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/LongFilenameTruncationExample.tsx?raw";
import PartialAcceptanceAndRejectionsExample from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/PartialAcceptanceAndRejectionsExample";
import partialAcceptanceAndRejectionsExampleSource from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/PartialAcceptanceAndRejectionsExample.tsx?raw";
import ReorderingExample from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/ReorderingExample";
import reorderingExampleSource from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/ReorderingExample.tsx?raw";
import ZodFieldValidationExample from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/ZodFieldValidationExample";
import zodFieldValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/ZodFieldValidationExample.tsx?raw";
import ZodFormValidationExample from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/ZodFormValidationExample";
import zodFormValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormFileListField/internal/storybook/ZodFormValidationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormFileListField } from "./VireoFormFileListField";

function createSourceParameters(code: string) {
  return { docs: { source: { code, language: "tsx", type: "code" as const } } };
}

const meta = {
  title: "UI/Capabilities/Forms/Fields/VireoFormFileListField",
  component: VireoFormFileListField,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormFileListField binds an ordered browser \`File[]\` collection to the current TanStack Form field through \`field.FileListField\`.

### Why it exists

Multi-file inputs otherwise repeat append semantics, partial batch acceptance, duplicate detection, collection limits, filename truncation, drag-and-drop, accessible reordering, per-file removal, previews, and validation presentation. Vireo centralizes that browser-side collection contract without owning uploads or remote file state. Use it when order and per-file collection management matter; use \`field.FileField\` for exactly one file.`,
      },
    },
  },
  argTypes: { slots: { control: false }, slotProps: { control: false }, classes: { control: false } },
} satisfies Meta<typeof VireoFormFileListField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};
export const AppendingFiles: Story = {
  render: () => <AppendingFilesExample />,
  parameters: createSourceParameters(appendingFilesExampleSource),
};
export const DragAndDrop: Story = {
  render: () => <DragAndDropExample />,
  parameters: createSourceParameters(dragAndDropExampleSource),
};
export const Reordering: Story = {
  render: () => <ReorderingExample />,
  parameters: createSourceParameters(reorderingExampleSource),
};
export const PartialAcceptanceAndRejections: Story = {
  render: () => <PartialAcceptanceAndRejectionsExample />,
  parameters: createSourceParameters(partialAcceptanceAndRejectionsExampleSource),
};
export const CapacityReached: Story = {
  render: () => <CapacityReachedExample />,
  parameters: createSourceParameters(capacityReachedExampleSource),
};
export const LongFilenameTruncation: Story = {
  render: () => <LongFilenameTruncationExample />,
  parameters: createSourceParameters(longFilenameTruncationExampleSource),
};
export const ImagePreviews: Story = {
  render: () => <ImagePreviewsExample />,
  parameters: createSourceParameters(imagePreviewsExampleSource),
};
export const DisabledAndReadOnly: Story = {
  render: () => <DisabledAndReadOnlyExample />,
  parameters: createSourceParameters(disabledAndReadOnlyExampleSource),
};
export const ZodFieldValidation: Story = {
  render: () => <ZodFieldValidationExample />,
  parameters: createSourceParameters(zodFieldValidationExampleSource),
};
export const ZodFormValidation: Story = {
  render: () => <ZodFormValidationExample />,
  parameters: createSourceParameters(zodFormValidationExampleSource),
};
