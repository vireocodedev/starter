import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoPageBody integration point. */
export const VIREO_PAGE_BODY_NAME = "VireoPageBody";

/** Canonical public slots exposed by VireoPageBody, in rendered DOM order. */
export const VIREO_PAGE_BODY_SLOTS = ["root", "content", "container", "drawer"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoPageBody. */
export type VireoPageBodySlotName = (typeof VIREO_PAGE_BODY_SLOTS)[number];
