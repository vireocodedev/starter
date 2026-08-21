import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormStep integration point. */
export const VIREO_FORM_STEP_NAME = "VireoFormStep";

/** Canonical public slots exposed by VireoFormStep, in rendered DOM order. */
export const VIREO_FORM_STEP_SLOTS = ["root", "label"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFormStep. */
export type VireoFormStepSlotName = (typeof VIREO_FORM_STEP_SLOTS)[number];
