import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME,
  VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_SLOTS,
  VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_STATES,
  type VireoFormToggleButtonGroupFieldSlotName,
  type VireoFormToggleButtonGroupFieldStateName,
} from "./VireoFormToggleButtonGroupField.identity";

/** Utility classes available to VireoFormToggleButtonGroupField. */
export type VireoFormToggleButtonGroupFieldClasses = Record<
  VireoFormToggleButtonGroupFieldSlotName | VireoFormToggleButtonGroupFieldStateName,
  string
>;

/** Valid keys for VireoFormToggleButtonGroupField utility classes and theme style overrides. */
export type VireoFormToggleButtonGroupFieldClassKey = keyof VireoFormToggleButtonGroupFieldClasses;

/** Returns the generated utility class name for a VireoFormToggleButtonGroupField slot or state. */
export function getVireoFormToggleButtonGroupFieldUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormToggleButtonGroupField class key. */
export const vireoFormToggleButtonGroupFieldClasses: VireoFormToggleButtonGroupFieldClasses = generateUtilityClasses(
  VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME,
  [...VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_SLOTS, ...VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_STATES],
);
