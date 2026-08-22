import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_COUNTER_FIELD_NAME,
  VIREO_FORM_COUNTER_FIELD_SLOTS,
  VIREO_FORM_COUNTER_FIELD_STATES,
  type VireoFormCounterFieldSlotName,
  type VireoFormCounterFieldStateName,
} from "./VireoFormCounterField.identity";

/** Utility classes available to VireoFormCounterField. */
export type VireoFormCounterFieldClasses = Record<
  VireoFormCounterFieldSlotName | VireoFormCounterFieldStateName,
  string
>;

/** Valid keys for VireoFormCounterField utility classes and theme style overrides. */
export type VireoFormCounterFieldClassKey = keyof VireoFormCounterFieldClasses;

/** Returns the generated utility class name for a VireoFormCounterField slot or state. */
export function getVireoFormCounterFieldUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_COUNTER_FIELD_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormCounterField class key. */
export const vireoFormCounterFieldClasses: VireoFormCounterFieldClasses = generateUtilityClasses(
  VIREO_FORM_COUNTER_FIELD_NAME,
  [...VIREO_FORM_COUNTER_FIELD_SLOTS, ...VIREO_FORM_COUNTER_FIELD_STATES],
);
