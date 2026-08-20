import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_FILE_FIELD_NAME,
  VIREO_FORM_FILE_FIELD_SLOTS,
  type VireoFormFileFieldSlotName,
} from "./VireoFormFileField.identity";

/** Utility classes available to VireoFormFileField. */
export type VireoFormFileFieldClasses = Record<
  | VireoFormFileFieldSlotName
  | "empty"
  | "populated"
  | "dragActive"
  | "dragReject"
  | "rejected"
  | "invalid"
  | "disabled"
  | "readOnly",
  string
>;

/** Valid keys for VireoFormFileField utility classes and theme style overrides. */
export type VireoFormFileFieldClassKey = keyof VireoFormFileFieldClasses;

/** Returns the generated utility class name for a VireoFormFileField slot or state. */
export function getVireoFormFileFieldUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_FILE_FIELD_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormFileField class key. */
export const vireoFormFileFieldClasses: VireoFormFileFieldClasses = generateUtilityClasses(VIREO_FORM_FILE_FIELD_NAME, [
  ...VIREO_FORM_FILE_FIELD_SLOTS,
  "empty",
  "populated",
  "dragActive",
  "dragReject",
  "rejected",
  "invalid",
  "disabled",
  "readOnly",
]);
