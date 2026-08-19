import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_COUNTER_INPUT_NAME,
  VIREO_COUNTER_INPUT_SLOTS,
  type VireoCounterInputSlotName,
} from "./VireoCounterInput.identity";

/** Utility classes available to VireoCounterInput. */
export type VireoCounterInputClasses = Record<VireoCounterInputSlotName, string>;

/** Valid keys for VireoCounterInput utility classes and theme style overrides. */
export type VireoCounterInputClassKey = keyof VireoCounterInputClasses;

/** Returns the generated utility class name for a VireoCounterInput slot or state. */
export function getVireoCounterInputUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_COUNTER_INPUT_NAME, slot);
}

/** Generated utility class names keyed by each public VireoCounterInput class key. */
export const vireoCounterInputClasses: VireoCounterInputClasses = generateUtilityClasses(VIREO_COUNTER_INPUT_NAME, [
  ...VIREO_COUNTER_INPUT_SLOTS,
]);
