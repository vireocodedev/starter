import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormSelectMultipleField integration point. */
export const VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME = "VireoFormSelectMultipleField";

/** Canonical public slots exposed by VireoFormSelectMultipleField, in rendered DOM order. */
export const VIREO_FORM_SELECT_MULTIPLE_FIELD_SLOTS = [
  "root",
  "inputLabel",
  "input",
  "htmlInput",
  "select",
  "selectionSummary",
  "option",
  "optionCheckbox",
  "optionText",
  "clearButton",
  "formHelperText",
] as const satisfies VireoSlotNameTuple;

/** Canonical interaction and validation states exposed as utility classes. */
export const VIREO_FORM_SELECT_MULTIPLE_FIELD_STATES = [
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

/** Public slot names exposed by VireoFormSelectMultipleField. */
export type VireoFormSelectMultipleFieldSlotName = (typeof VIREO_FORM_SELECT_MULTIPLE_FIELD_SLOTS)[number];

/** Public state names exposed by VireoFormSelectMultipleField. */
export type VireoFormSelectMultipleFieldStateName = (typeof VIREO_FORM_SELECT_MULTIPLE_FIELD_STATES)[number];
