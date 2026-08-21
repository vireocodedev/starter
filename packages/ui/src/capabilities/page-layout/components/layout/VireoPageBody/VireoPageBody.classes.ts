import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import { VIREO_PAGE_BODY_NAME, VIREO_PAGE_BODY_SLOTS, type VireoPageBodySlotName } from "./VireoPageBody.identity";

/** Utility classes available to VireoPageBody. */
export type VireoPageBodyClasses = Record<VireoPageBodySlotName, string>;

/** Valid keys for VireoPageBody utility classes and theme style overrides. */
export type VireoPageBodyClassKey = keyof VireoPageBodyClasses;

/** Returns the generated utility class name for a VireoPageBody slot or state. */
export function getVireoPageBodyUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_PAGE_BODY_NAME, slot);
}

/** Generated utility class names keyed by each public VireoPageBody class key. */
export const vireoPageBodyClasses: VireoPageBodyClasses = generateUtilityClasses(VIREO_PAGE_BODY_NAME, [
  ...VIREO_PAGE_BODY_SLOTS,
]);
