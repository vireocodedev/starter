import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_FILE_LIST_FIELD_NAME,
  VIREO_FORM_FILE_LIST_FIELD_SLOTS,
  type VireoFormFileListFieldSlotName,
} from "./VireoFormFileListField.identity";

export type VireoFormFileListFieldStateClass =
  | "empty"
  | "populated"
  | "dragActive"
  | "dragReject"
  | "rejected"
  | "invalid"
  | "disabled"
  | "readOnly"
  | "required"
  | "fullWidth"
  | "reorderable"
  | "capacityReached"
  | "reordering"
  | "submitting"
  | "validating";

/** Utility classes available to VireoFormFileListField. */
export type VireoFormFileListFieldClasses = Record<
  VireoFormFileListFieldSlotName | VireoFormFileListFieldStateClass,
  string
>;

/** Valid keys for VireoFormFileListField utility classes and theme style overrides. */
export type VireoFormFileListFieldClassKey = keyof VireoFormFileListFieldClasses;

/** Returns the generated utility class name for a VireoFormFileListField slot or state. */
export function getVireoFormFileListFieldUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_FILE_LIST_FIELD_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormFileListField class key. */
export const vireoFormFileListFieldClasses: VireoFormFileListFieldClasses = generateUtilityClasses(
  VIREO_FORM_FILE_LIST_FIELD_NAME,
  [
    ...VIREO_FORM_FILE_LIST_FIELD_SLOTS,
    "empty",
    "populated",
    "dragActive",
    "dragReject",
    "rejected",
    "invalid",
    "disabled",
    "readOnly",
    "required",
    "fullWidth",
    "reorderable",
    "capacityReached",
    "reordering",
    "submitting",
    "validating",
  ],
);
