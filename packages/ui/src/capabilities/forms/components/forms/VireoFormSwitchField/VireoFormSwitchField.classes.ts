import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_SWITCH_FIELD_NAME,
  VIREO_FORM_SWITCH_FIELD_SLOTS,
  VIREO_FORM_SWITCH_FIELD_STATES,
  type VireoFormSwitchFieldSlotName,
  type VireoFormSwitchFieldStateName,
} from "./VireoFormSwitchField.identity";

/** Utility classes available to VireoFormSwitchField. */
export type VireoFormSwitchFieldClasses = Record<VireoFormSwitchFieldSlotName | VireoFormSwitchFieldStateName, string>;

/** Valid keys for VireoFormSwitchField utility classes and theme style overrides. */
export type VireoFormSwitchFieldClassKey = keyof VireoFormSwitchFieldClasses;

/** Returns the generated utility class name for a VireoFormSwitchField slot or state. */
export function getVireoFormSwitchFieldUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_SWITCH_FIELD_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormSwitchField class key. */
export const vireoFormSwitchFieldClasses: VireoFormSwitchFieldClasses = generateUtilityClasses(
  VIREO_FORM_SWITCH_FIELD_NAME,
  [...VIREO_FORM_SWITCH_FIELD_SLOTS, ...VIREO_FORM_SWITCH_FIELD_STATES],
);
