import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoResponsiveTable integration point. */
export const VIREO_RESPONSIVE_TABLE_NAME = "VireoResponsiveTable";

/** Canonical public slots exposed by VireoResponsiveTable, in rendered DOM order. */
export const VIREO_RESPONSIVE_TABLE_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoResponsiveTable. */
export type VireoResponsiveTableSlotName = (typeof VIREO_RESPONSIVE_TABLE_SLOTS)[number];
