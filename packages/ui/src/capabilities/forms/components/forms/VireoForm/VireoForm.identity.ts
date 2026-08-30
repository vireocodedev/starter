import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoForm integration point. */
export const VIREO_FORM_NAME = "VireoForm";

/** Canonical public slots exposed by VireoForm, in rendered DOM order. */
export const VIREO_FORM_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoForm. */
export type VireoFormSlotName = (typeof VIREO_FORM_SLOTS)[number];

/** Canonical state classes exposed by VireoForm. */
export const VIREO_FORM_STATES = ["dirty", "submitting", "validating", "invalid", "readOnly"] as const;

/** Public state names exposed by VireoForm. */
export type VireoFormStateName = (typeof VIREO_FORM_STATES)[number];
