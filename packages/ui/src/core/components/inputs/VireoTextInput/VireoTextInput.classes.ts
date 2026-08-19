import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import { VIREO_TEXT_INPUT_NAME, VIREO_TEXT_INPUT_SLOTS, type VireoTextInputSlotName } from "./VireoTextInput.identity";

/** Utility classes available to VireoTextInput. */
export type VireoTextInputClasses = Record<VireoTextInputSlotName, string>;

/** Valid keys for VireoTextInput utility classes and theme style overrides. */
export type VireoTextInputClassKey = keyof VireoTextInputClasses;

/** Returns the generated utility class name for a VireoTextInput slot or state. */
export function getVireoTextInputUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_TEXT_INPUT_NAME, slot);
}

/** Generated utility class names keyed by each public VireoTextInput class key. */
export const vireoTextInputClasses: VireoTextInputClasses = generateUtilityClasses(VIREO_TEXT_INPUT_NAME, [
  ...VIREO_TEXT_INPUT_SLOTS,
]);
