import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormReadOnlyValue integration point. */
export const VIREO_FORM_READ_ONLY_VALUE_NAME = "VireoFormReadOnlyValue";

/** Canonical public slots exposed by VireoFormReadOnlyValue, in rendered DOM order. */
export const VIREO_FORM_READ_ONLY_VALUE_SLOTS = ["root", "label", "value"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFormReadOnlyValue. */
export type VireoFormReadOnlyValueSlotName = (typeof VIREO_FORM_READ_ONLY_VALUE_SLOTS)[number];
