import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormToggleButtonGroupField integration point. */
export const VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME = "VireoFormToggleButtonGroupField";

/** Canonical public slots exposed by VireoFormToggleButtonGroupField, in rendered DOM order. */
export const VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_SLOTS = [
  "root",
  "toggleButtonGroup",
  "toggleButton",
  "formHelperText",
] as const satisfies VireoSlotNameTuple;

/** Canonical interaction and validation states exposed as utility classes. */
export const VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_STATES = [
  "dirty",
  "touched",
  "invalid",
  "errorVisible",
  "validating",
  "submitting",
  "disabled",
  "readOnly",
  "hasValue",
  "multiple",
] as const;

/** Public slot names exposed by VireoFormToggleButtonGroupField. */
export type VireoFormToggleButtonGroupFieldSlotName = (typeof VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_SLOTS)[number];

/** Public state names exposed by VireoFormToggleButtonGroupField. */
export type VireoFormToggleButtonGroupFieldStateName = (typeof VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_STATES)[number];
