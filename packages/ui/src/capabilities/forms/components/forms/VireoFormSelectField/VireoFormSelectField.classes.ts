import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_SELECT_FIELD_NAME,
  VIREO_FORM_SELECT_FIELD_SLOTS,
  VIREO_FORM_SELECT_FIELD_STATES,
  type VireoFormSelectFieldSlotName,
  type VireoFormSelectFieldStateName,
} from "./VireoFormSelectField.identity";

/** Utility classes available to VireoFormSelectField. */
export type VireoFormSelectFieldClasses = Record<VireoFormSelectFieldSlotName | VireoFormSelectFieldStateName, string>;

/** Valid keys for VireoFormSelectField utility classes and theme style overrides. */
export type VireoFormSelectFieldClassKey = keyof VireoFormSelectFieldClasses;

/** Returns the generated utility class name for a VireoFormSelectField slot or state. */
export function getVireoFormSelectFieldUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_SELECT_FIELD_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormSelectField class key. */
export const vireoFormSelectFieldClasses: VireoFormSelectFieldClasses = generateUtilityClasses(
  VIREO_FORM_SELECT_FIELD_NAME,
  [...VIREO_FORM_SELECT_FIELD_SLOTS, ...VIREO_FORM_SELECT_FIELD_STATES],
);
