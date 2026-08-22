import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormMultiStep integration point. */
export const VIREO_FORM_MULTI_STEP_NAME = "VireoFormMultiStep";

/** Canonical public slots exposed by VireoFormMultiStep, in rendered DOM order. */
export const VIREO_FORM_MULTI_STEP_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFormMultiStep. */
export type VireoFormMultiStepSlotName = (typeof VIREO_FORM_MULTI_STEP_SLOTS)[number];
