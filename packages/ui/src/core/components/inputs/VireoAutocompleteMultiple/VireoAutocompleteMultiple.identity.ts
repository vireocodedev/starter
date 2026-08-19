import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoAutocompleteMultiple integration point. */
export const VIREO_AUTOCOMPLETE_MULTIPLE_NAME = "VireoAutocompleteMultiple";

/** Canonical public slots exposed by VireoAutocompleteMultiple, in rendered DOM order. */
export const VIREO_AUTOCOMPLETE_MULTIPLE_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoAutocompleteMultiple. */
export type VireoAutocompleteMultipleSlotName = (typeof VIREO_AUTOCOMPLETE_MULTIPLE_SLOTS)[number];
