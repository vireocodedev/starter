import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import { VIREO_STATUS_DOT_NAME, VIREO_STATUS_DOT_SLOTS, type VireoStatusDotSlotName } from "./VireoStatusDot.identity";

/** Utility classes available to VireoStatusDot. */
export type VireoStatusDotClasses = Record<VireoStatusDotSlotName | "selected", string>;

/** Valid keys for VireoStatusDot utility classes and theme style overrides. */
export type VireoStatusDotClassKey = keyof VireoStatusDotClasses;

/** Returns the generated utility class name for a VireoStatusDot slot or state. */
export function getVireoStatusDotUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_STATUS_DOT_NAME, slot);
}

/** Generated utility class names keyed by each public VireoStatusDot class key. */
export const vireoStatusDotClasses: VireoStatusDotClasses = generateUtilityClasses(VIREO_STATUS_DOT_NAME, [
  ...VIREO_STATUS_DOT_SLOTS,
  "selected",
]);
