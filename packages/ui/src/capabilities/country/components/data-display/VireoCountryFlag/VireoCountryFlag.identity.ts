import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoCountryFlag integration point. */
export const VIREO_COUNTRY_FLAG_NAME = "VireoCountryFlag";

/** Canonical public slots exposed by VireoCountryFlag, in rendered DOM order. */
export const VIREO_COUNTRY_FLAG_SLOTS = ["root", "flag", "tooltip"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoCountryFlag. */
export type VireoCountryFlagSlotName = (typeof VIREO_COUNTRY_FLAG_SLOTS)[number];
