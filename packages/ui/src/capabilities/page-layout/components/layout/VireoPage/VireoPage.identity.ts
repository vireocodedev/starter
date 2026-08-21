import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoPage integration point. */
export const VIREO_PAGE_NAME = "VireoPage";

/** Canonical public slots exposed by VireoPage, in rendered DOM order. */
export const VIREO_PAGE_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoPage. */
export type VireoPageSlotName = (typeof VIREO_PAGE_SLOTS)[number];
