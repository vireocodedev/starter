import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormSectionItem integration point. */
export const VIREO_FORM_SECTION_ITEM_NAME = "VireoFormSectionItem";

/** Canonical public slots exposed by VireoFormSectionItem, in rendered DOM order. */
export const VIREO_FORM_SECTION_ITEM_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFormSectionItem. */
export type VireoFormSectionItemSlotName = (typeof VIREO_FORM_SECTION_ITEM_SLOTS)[number];
