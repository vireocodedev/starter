import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormSwitchField integration point. */
export const VIREO_FORM_SWITCH_FIELD_NAME = "VireoFormSwitchField";

/** Canonical public slots exposed by VireoFormSwitchField, in rendered DOM order. */
export const VIREO_FORM_SWITCH_FIELD_SLOTS = [
  "root",
  "formControlLabel",
  "switch",
  "label",
  "formHelperText",
] as const satisfies VireoSlotNameTuple;

/** Canonical interaction and validation states exposed as utility classes. */
export const VIREO_FORM_SWITCH_FIELD_STATES = [
  "checked",
  "dirty",
  "touched",
  "invalid",
  "errorVisible",
  "validating",
  "submitting",
  "disabled",
  "readOnly",
] as const;

/** Public slot names exposed by VireoFormSwitchField. */
export type VireoFormSwitchFieldSlotName = (typeof VIREO_FORM_SWITCH_FIELD_SLOTS)[number];

/** Public state names exposed by VireoFormSwitchField. */
export type VireoFormSwitchFieldStateName = (typeof VIREO_FORM_SWITCH_FIELD_STATES)[number];
