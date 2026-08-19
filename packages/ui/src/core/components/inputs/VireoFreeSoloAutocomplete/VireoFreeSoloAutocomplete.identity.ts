import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoFreeSoloAutocomplete integration point. */
export const VIREO_FREE_SOLO_AUTOCOMPLETE_NAME = "VireoFreeSoloAutocomplete";

/** Canonical public slots exposed by VireoFreeSoloAutocomplete, in rendered DOM order. */
export const VIREO_FREE_SOLO_AUTOCOMPLETE_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFreeSoloAutocomplete. */
export type VireoFreeSoloAutocompleteSlotName = (typeof VIREO_FREE_SOLO_AUTOCOMPLETE_SLOTS)[number];
