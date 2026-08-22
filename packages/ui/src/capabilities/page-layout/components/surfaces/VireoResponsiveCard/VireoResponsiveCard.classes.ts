import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_RESPONSIVE_CARD_NAME,
  VIREO_RESPONSIVE_CARD_SLOTS,
  type VireoResponsiveCardSlotName,
} from "./VireoResponsiveCard.identity";

/** Utility classes available to VireoResponsiveCard. */
export type VireoResponsiveCardClasses = Record<VireoResponsiveCardSlotName, string>;

/** Valid keys for VireoResponsiveCard utility classes and theme style overrides. */
export type VireoResponsiveCardClassKey = keyof VireoResponsiveCardClasses;

/** Returns the generated utility class name for a VireoResponsiveCard slot or state. */
export function getVireoResponsiveCardUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_RESPONSIVE_CARD_NAME, slot);
}

/** Generated utility class names keyed by each public VireoResponsiveCard class key. */
export const vireoResponsiveCardClasses: VireoResponsiveCardClasses = generateUtilityClasses(
  VIREO_RESPONSIVE_CARD_NAME,
  [...VIREO_RESPONSIVE_CARD_SLOTS],
);
