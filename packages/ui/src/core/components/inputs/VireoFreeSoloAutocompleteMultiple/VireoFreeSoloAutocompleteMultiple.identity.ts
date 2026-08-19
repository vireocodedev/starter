import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoFreeSoloAutocompleteMultiple integration point. */
export const VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_NAME = "VireoFreeSoloAutocompleteMultiple";

/** Canonical public slots exposed by VireoFreeSoloAutocompleteMultiple, in rendered DOM order. */
export const VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFreeSoloAutocompleteMultiple. */
export type VireoFreeSoloAutocompleteMultipleSlotName = (typeof VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_SLOTS)[number];
