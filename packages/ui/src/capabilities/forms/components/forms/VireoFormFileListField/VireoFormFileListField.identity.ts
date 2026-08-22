import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormFileListField integration point. */
export const VIREO_FORM_FILE_LIST_FIELD_NAME = "VireoFormFileListField";

/** Canonical public slots exposed by VireoFormFileListField, in rendered DOM order. */
export const VIREO_FORM_FILE_LIST_FIELD_SLOTS = [
  "root",
  "input",
  "chooser",
  "selectButton",
  "dropHint",
  "capacityText",
  "toolbar",
  "fileCount",
  "clearAllButton",
  "list",
  "fileRow",
  "reorderHandle",
  "metadata",
  "fileName",
  "fileSize",
  "removeButton",
  "previewContainer",
  "rejectionList",
  "rejectionItem",
  "helperText",
  "liveRegion",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFormFileListField. */
export type VireoFormFileListFieldSlotName = (typeof VIREO_FORM_FILE_LIST_FIELD_SLOTS)[number];
