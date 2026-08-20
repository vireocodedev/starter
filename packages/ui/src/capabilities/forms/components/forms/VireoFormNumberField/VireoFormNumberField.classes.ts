import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_NUMBER_FIELD_NAME,
  VIREO_FORM_NUMBER_FIELD_SLOTS,
  VIREO_FORM_NUMBER_FIELD_STATES,
  type VireoFormNumberFieldSlotName,
  type VireoFormNumberFieldStateName,
} from "./VireoFormNumberField.identity";

/** Utility classes available to VireoFormNumberField. */
export type VireoFormNumberFieldClasses = Record<VireoFormNumberFieldSlotName | VireoFormNumberFieldStateName, string>;

/** Valid keys for VireoFormNumberField utility classes and theme style overrides. */
export type VireoFormNumberFieldClassKey = keyof VireoFormNumberFieldClasses;

/** Returns the generated utility class name for a VireoFormNumberField slot or state. */
export function getVireoFormNumberFieldUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_NUMBER_FIELD_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormNumberField class key. */
export const vireoFormNumberFieldClasses: VireoFormNumberFieldClasses = generateUtilityClasses(
  VIREO_FORM_NUMBER_FIELD_NAME,
  [...VIREO_FORM_NUMBER_FIELD_SLOTS, ...VIREO_FORM_NUMBER_FIELD_STATES],
);
