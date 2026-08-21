import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoPageHeader integration point. */
export const VIREO_PAGE_HEADER_NAME = "VireoPageHeader";

/** Canonical public slots exposed by VireoPageHeader, in rendered DOM order. */
export const VIREO_PAGE_HEADER_SLOTS = ["root", "leading", "title", "actions"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoPageHeader. */
export type VireoPageHeaderSlotName = (typeof VIREO_PAGE_HEADER_SLOTS)[number];
