import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import { VIREO_LABEL_BOX_NAME, VIREO_LABEL_BOX_SLOTS, type VireoLabelBoxSlotName } from "./VireoLabelBox.identity";

/** Utility classes available to VireoLabelBox. */
export type VireoLabelBoxClasses = Record<VireoLabelBoxSlotName, string>;

/** Valid keys for VireoLabelBox utility classes and theme style overrides. */
export type VireoLabelBoxClassKey = keyof VireoLabelBoxClasses;

/** Returns the generated utility class name for a VireoLabelBox slot or state. */
export function getVireoLabelBoxUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_LABEL_BOX_NAME, slot);
}

/** Generated utility class names keyed by each public VireoLabelBox class key. */
export const vireoLabelBoxClasses: VireoLabelBoxClasses = generateUtilityClasses(VIREO_LABEL_BOX_NAME, [
  ...VIREO_LABEL_BOX_SLOTS,
]);
