import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormFileField integration point. */
export const VIREO_FORM_FILE_FIELD_NAME = "VireoFormFileField";

/** Canonical public slots exposed by VireoFormFileField, in rendered DOM order. */
export const VIREO_FORM_FILE_FIELD_SLOTS = [
  "root",
  "selection",
  "input",
  "selectButton",
  "metadata",
  "fileName",
  "fileSize",
  "clearButton",
  "dropOverlay",
  "previewContainer",
  "helperText",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFormFileField. */
export type VireoFormFileFieldSlotName = (typeof VIREO_FORM_FILE_FIELD_SLOTS)[number];
