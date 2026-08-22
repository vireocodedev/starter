import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormCounterField integration point. */
export const VIREO_FORM_COUNTER_FIELD_NAME = "VireoFormCounterField";

/** Canonical public slots exposed by VireoFormCounterField, in rendered DOM order. */
export const VIREO_FORM_COUNTER_FIELD_SLOTS = [
  "root",
  "input",
  "decrementButton",
  "decrementIcon",
  "htmlInput",
  "incrementButton",
  "incrementIcon",
  "formHelperText",
] as const satisfies VireoSlotNameTuple;

/** Canonical interaction and validation states exposed as utility classes. */
export const VIREO_FORM_COUNTER_FIELD_STATES = [
  "dirty",
  "touched",
  "invalid",
  "errorVisible",
  "validating",
  "submitting",
  "disabled",
  "readOnly",
  "hasValue",
  "atMin",
  "atMax",
] as const;

/** Public slot names exposed by VireoFormCounterField. */
export type VireoFormCounterFieldSlotName = (typeof VIREO_FORM_COUNTER_FIELD_SLOTS)[number];

/** Public state names exposed by VireoFormCounterField. */
export type VireoFormCounterFieldStateName = (typeof VIREO_FORM_COUNTER_FIELD_STATES)[number];
