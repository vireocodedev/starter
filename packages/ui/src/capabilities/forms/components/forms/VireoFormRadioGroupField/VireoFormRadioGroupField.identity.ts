import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormRadioGroupField integration point. */
export const VIREO_FORM_RADIO_GROUP_FIELD_NAME = "VireoFormRadioGroupField";

/** Canonical public slots exposed by VireoFormRadioGroupField, in rendered DOM order. */
export const VIREO_FORM_RADIO_GROUP_FIELD_SLOTS = [
  "root",
  "radioGroup",
  "formControlLabel",
  "radio",
  "optionLabel",
  "formHelperText",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFormRadioGroupField. */
export type VireoFormRadioGroupFieldSlotName = (typeof VIREO_FORM_RADIO_GROUP_FIELD_SLOTS)[number];
