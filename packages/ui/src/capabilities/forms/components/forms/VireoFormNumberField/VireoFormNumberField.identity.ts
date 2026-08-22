import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormNumberField integration point. */
export const VIREO_FORM_NUMBER_FIELD_NAME = "VireoFormNumberField";

/** Canonical public slots exposed by VireoFormNumberField, in rendered DOM order. */
export const VIREO_FORM_NUMBER_FIELD_SLOTS = [
  "root",
  "inputLabel",
  "input",
  "htmlInput",
  "formHelperText",
] as const satisfies VireoSlotNameTuple;

/** Canonical interaction and validation states exposed as utility classes. */
export const VIREO_FORM_NUMBER_FIELD_STATES = [
  "dirty",
  "touched",
  "invalid",
  "errorVisible",
  "validating",
  "submitting",
  "disabled",
  "readOnly",
] as const;

/** Public slot names exposed by VireoFormNumberField. */
export type VireoFormNumberFieldSlotName = (typeof VIREO_FORM_NUMBER_FIELD_SLOTS)[number];

/** Public state names exposed by VireoFormNumberField. */
export type VireoFormNumberFieldStateName = (typeof VIREO_FORM_NUMBER_FIELD_STATES)[number];
