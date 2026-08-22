import type { VireoSlotNameTuple } from "@/core/public";

/** Stable component name shared by every VireoFormResetButton integration point. */
export const VIREO_FORM_RESET_BUTTON_NAME = "VireoFormResetButton";

/** Canonical public slots exposed by VireoFormResetButton, in rendered DOM order. */
export const VIREO_FORM_RESET_BUTTON_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoFormResetButton. */
export type VireoFormResetButtonSlotName = (typeof VIREO_FORM_RESET_BUTTON_SLOTS)[number];

/** Canonical state classes exposed by VireoFormResetButton. */
export const VIREO_FORM_RESET_BUTTON_STATES = ["dirty", "disabled", "pristine"] as const;

/** Public state names exposed by VireoFormResetButton. */
export type VireoFormResetButtonStateName = (typeof VIREO_FORM_RESET_BUTTON_STATES)[number];
