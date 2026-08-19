import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoAutocomplete integration point. */
export const VIREO_AUTOCOMPLETE_NAME = "VireoAutocomplete";

/** Canonical public slots exposed by VireoAutocomplete, in rendered DOM order. */
export const VIREO_AUTOCOMPLETE_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoAutocomplete. */
export type VireoAutocompleteSlotName = (typeof VIREO_AUTOCOMPLETE_SLOTS)[number];
