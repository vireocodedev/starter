import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoResponsiveCard integration point. */
export const VIREO_RESPONSIVE_CARD_NAME = "VireoResponsiveCard";

/** Canonical public slots exposed by VireoResponsiveCard, in rendered DOM order. */
export const VIREO_RESPONSIVE_CARD_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoResponsiveCard. */
export type VireoResponsiveCardSlotName = (typeof VIREO_RESPONSIVE_CARD_SLOTS)[number];
