import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_HISTORY_ENTRY_NAME,
  VIREO_HISTORY_ENTRY_SLOTS,
  type VireoHistoryEntrySlotName,
} from "./VireoHistoryEntry.identity";

export type VireoHistoryEntryStateClassKey = "loading";

/** Utility classes available to VireoHistoryEntry. */
export type VireoHistoryEntryClasses = Record<VireoHistoryEntrySlotName | VireoHistoryEntryStateClassKey, string>;

/** Valid keys for VireoHistoryEntry utility classes and theme style overrides. */
export type VireoHistoryEntryClassKey = keyof VireoHistoryEntryClasses;

/** Returns the generated utility class name for a VireoHistoryEntry slot or state. */
export function getVireoHistoryEntryUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_HISTORY_ENTRY_NAME, slot);
}

/** Generated utility class names keyed by each public VireoHistoryEntry class key. */
export const vireoHistoryEntryClasses: VireoHistoryEntryClasses = generateUtilityClasses(VIREO_HISTORY_ENTRY_NAME, [
  ...VIREO_HISTORY_ENTRY_SLOTS,
  "loading",
]);
