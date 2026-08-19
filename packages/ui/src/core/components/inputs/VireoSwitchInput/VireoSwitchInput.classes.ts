import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_SWITCH_INPUT_NAME,
  VIREO_SWITCH_INPUT_SLOTS,
  type VireoSwitchInputSlotName,
} from "./VireoSwitchInput.identity";

/** Utility classes available to VireoSwitchInput. */
export type VireoSwitchInputClasses = Record<VireoSwitchInputSlotName, string>;

/** Valid keys for VireoSwitchInput utility classes and theme style overrides. */
export type VireoSwitchInputClassKey = keyof VireoSwitchInputClasses;

/** Returns the generated utility class name for a VireoSwitchInput slot or state. */
export function getVireoSwitchInputUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_SWITCH_INPUT_NAME, slot);
}

/** Generated utility class names keyed by each public VireoSwitchInput class key. */
export const vireoSwitchInputClasses: VireoSwitchInputClasses = generateUtilityClasses(VIREO_SWITCH_INPUT_NAME, [
  ...VIREO_SWITCH_INPUT_SLOTS,
]);
