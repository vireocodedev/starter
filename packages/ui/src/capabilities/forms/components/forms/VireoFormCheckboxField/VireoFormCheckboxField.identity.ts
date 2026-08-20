import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormCheckboxField integration point. */
export const VIREO_FORM_CHECKBOX_FIELD_NAME = "VireoFormCheckboxField";

/** Canonical public slots exposed by VireoFormCheckboxField, in rendered DOM order. */
export const VIREO_FORM_CHECKBOX_FIELD_SLOTS = [
  "root",
  "formControlLabel",
  "checkbox",
  "label",
  "formHelperText",
] as const satisfies VireoSlotNameTuple;

/** Canonical interaction and validation states exposed as utility classes. */
export const VIREO_FORM_CHECKBOX_FIELD_STATES = [
  "checked",
  "dirty",
  "touched",
  "invalid",
  "errorVisible",
  "validating",
  "submitting",
  "disabled",
] as const;

/** Public slot names exposed by VireoFormCheckboxField. */
export type VireoFormCheckboxFieldSlotName = (typeof VIREO_FORM_CHECKBOX_FIELD_SLOTS)[number];

/** Public state names exposed by VireoFormCheckboxField. */
export type VireoFormCheckboxFieldStateName = (typeof VIREO_FORM_CHECKBOX_FIELD_STATES)[number];
