import type { VireoSlotNameTuple } from "@/core/public";
export const VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_NAME = "VireoFormFreeSoloAutocompleteMultipleField";
export const VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_SLOTS = [
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
  "selectedOptions",
  "selectedOption",
  "selectedOptionDeleteIcon",
  "hiddenOptionsButton",
  "optionCheckbox",
] as const satisfies VireoSlotNameTuple;
export const VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_STATES = [
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
  "atSelectionLimit",
  "hasHiddenOptions",
] as const;
export type VireoFormFreeSoloAutocompleteMultipleFieldSlotName =
  (typeof VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_SLOTS)[number];
export type VireoFormFreeSoloAutocompleteMultipleFieldStateName =
  (typeof VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_STATES)[number];
