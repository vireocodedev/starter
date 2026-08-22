import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_TEXT_FIELD_NAME,
  VIREO_FORM_TEXT_FIELD_SLOTS,
  VIREO_FORM_TEXT_FIELD_STATES,
  type VireoFormTextFieldSlotName,
  type VireoFormTextFieldStateName,
} from "./VireoFormTextField.identity";

/** Utility classes available to VireoFormTextField. */
export type VireoFormTextFieldClasses = Record<VireoFormTextFieldSlotName | VireoFormTextFieldStateName, string>;

/** Valid keys for VireoFormTextField utility classes and theme style overrides. */
export type VireoFormTextFieldClassKey = keyof VireoFormTextFieldClasses;

/** Returns the generated utility class name for a VireoFormTextField slot or state. */
export function getVireoFormTextFieldUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_TEXT_FIELD_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormTextField class key. */
export const vireoFormTextFieldClasses: VireoFormTextFieldClasses = generateUtilityClasses(VIREO_FORM_TEXT_FIELD_NAME, [
  ...VIREO_FORM_TEXT_FIELD_SLOTS,
  ...VIREO_FORM_TEXT_FIELD_STATES,
]);
