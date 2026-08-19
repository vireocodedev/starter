import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import { VIREO_STOPWATCH_NAME, VIREO_STOPWATCH_SLOTS, type VireoStopwatchSlotName } from "./VireoStopwatch.identity";

/** Utility classes available to VireoStopwatch. */
export type VireoStopwatchClasses = Record<VireoStopwatchSlotName, string>;

/** Valid keys for VireoStopwatch utility classes and theme style overrides. */
export type VireoStopwatchClassKey = keyof VireoStopwatchClasses;

/** Returns the generated utility class name for a VireoStopwatch slot or state. */
export function getVireoStopwatchUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_STOPWATCH_NAME, slot);
}

/** Generated utility class names keyed by each public VireoStopwatch class key. */
export const vireoStopwatchClasses: VireoStopwatchClasses = generateUtilityClasses(VIREO_STOPWATCH_NAME, [
  ...VIREO_STOPWATCH_SLOTS,
]);
