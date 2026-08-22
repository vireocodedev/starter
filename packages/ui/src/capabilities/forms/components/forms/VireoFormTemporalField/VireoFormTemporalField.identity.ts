import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormTemporalField integration point. */
export const VIREO_FORM_TEMPORAL_FIELD_NAME = "VireoFormTemporalField";

/** Canonical public slots exposed by VireoFormTemporalField, in rendered DOM order. */
export const VIREO_FORM_TEMPORAL_FIELD_SLOTS = [
  "root",
  "input",
  "htmlInput",
  "formHelperText",
  "openPickerButton",
  "openPickerIcon",
  "clearButton",
  "clearIcon",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFormTemporalField. */
export type VireoFormTemporalFieldSlotName = (typeof VIREO_FORM_TEMPORAL_FIELD_SLOTS)[number];
