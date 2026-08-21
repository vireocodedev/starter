import type { VireoSlotNameTuple } from "@/core/public";

export const VIREO_FORM_AUTOCOMPLETE_FIELD_NAME = "VireoFormAutocompleteField";

export const VIREO_FORM_AUTOCOMPLETE_FIELD_SLOTS = [
  "root",
  "textField",
  "inputLabel",
  "input",
  "htmlInput",
  "loadingIndicator",
  "clearButton",
  "clearIcon",
  "popupButton",
  "popupIcon",
  "formHelperText",
  "popper",
  "paper",
  "loadingText",
  "noOptionsText",
  "listbox",
  "option",
  "group",
  "groupLabel",
  "groupList",
] as const satisfies VireoSlotNameTuple;

export const VIREO_FORM_AUTOCOMPLETE_FIELD_STATES = [
  "disabled",
  "readOnly",
  "required",
  "error",
  "focused",
  "dirty",
  "touched",
  "submitting",
  "validating",
  "open",
  "loading",
  "hasValue",
  "hasInputValue",
  "hasUnresolvedValue",
] as const;

export type VireoFormAutocompleteFieldSlotName = (typeof VIREO_FORM_AUTOCOMPLETE_FIELD_SLOTS)[number];
export type VireoFormAutocompleteFieldStateName = (typeof VIREO_FORM_AUTOCOMPLETE_FIELD_STATES)[number];
