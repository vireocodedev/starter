import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import { VIREO_DROP_ZONE_NAME, VIREO_DROP_ZONE_SLOTS, type VireoDropZoneSlotName } from "./VireoDropZone.identity";

/** Utility classes available to VireoDropZone. */
export type VireoDropZoneClasses = Record<
  VireoDropZoneSlotName | "candidate" | "disabled" | "over" | "rejected",
  string
>;

/** Valid keys for VireoDropZone utility classes and theme style overrides. */
export type VireoDropZoneClassKey = keyof VireoDropZoneClasses;

/** Returns the generated utility class name for a VireoDropZone slot or state. */
export function getVireoDropZoneUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_DROP_ZONE_NAME, slot);
}

/** Generated utility class names keyed by each public VireoDropZone class key. */
export const vireoDropZoneClasses: VireoDropZoneClasses = generateUtilityClasses(VIREO_DROP_ZONE_NAME, [
  ...VIREO_DROP_ZONE_SLOTS,
  "candidate",
  "disabled",
  "over",
  "rejected",
]);
