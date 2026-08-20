import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormSelectField integration point. */
export const VIREO_FORM_SELECT_FIELD_NAME = "VireoFormSelectField";

/** Canonical public slots exposed by VireoFormSelectField, in rendered DOM order. */
export const VIREO_FORM_SELECT_FIELD_SLOTS = [
  "root",
  "inputLabel",
  "input",
  "htmlInput",
  "select",
  "option",
  "optionText",
  "clearButton",
  "formHelperText",
] as const satisfies VireoSlotNameTuple;

/** Canonical interaction and validation states exposed as utility classes. */
export const VIREO_FORM_SELECT_FIELD_STATES = [
  "dirty",
  "touched",
  "invalid",
  "errorVisible",
  "validating",
  "submitting",
  "disabled",
  "readOnly",
  "hasValue",
] as const;

/** Public slot names exposed by VireoFormSelectField. */
export type VireoFormSelectFieldSlotName = (typeof VIREO_FORM_SELECT_FIELD_SLOTS)[number];

/** Public state names exposed by VireoFormSelectField. */
export type VireoFormSelectFieldStateName = (typeof VIREO_FORM_SELECT_FIELD_STATES)[number];
