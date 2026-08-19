import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormTextField integration point. */
export const VIREO_FORM_TEXT_FIELD_NAME = "VireoFormTextField";

/** Canonical public slots exposed by VireoFormTextField, in rendered DOM order. */
export const VIREO_FORM_TEXT_FIELD_SLOTS = [
  "root",
  "inputLabel",
  "input",
  "htmlInput",
  "formHelperText",
  "select",
] as const satisfies VireoSlotNameTuple;

/** Canonical interaction and validation states exposed as utility classes. */
export const VIREO_FORM_TEXT_FIELD_STATES = [
  "dirty",
  "touched",
  "invalid",
  "errorVisible",
  "validating",
  "submitting",
  "disabled",
  "readOnly",
] as const;

/** Public slot names exposed by VireoFormTextField. */
export type VireoFormTextFieldSlotName = (typeof VIREO_FORM_TEXT_FIELD_SLOTS)[number];

/** Public state names exposed by VireoFormTextField. */
export type VireoFormTextFieldStateName = (typeof VIREO_FORM_TEXT_FIELD_STATES)[number];
