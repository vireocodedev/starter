import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoHistoryEntry integration point. */
export const VIREO_HISTORY_ENTRY_NAME = "VireoHistoryEntry";

/** Canonical public slots exposed by VireoHistoryEntry, in rendered DOM order. */
export const VIREO_HISTORY_ENTRY_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoHistoryEntry. */
export type VireoHistoryEntrySlotName = (typeof VIREO_HISTORY_ENTRY_SLOTS)[number];
