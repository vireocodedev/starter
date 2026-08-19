import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoPasswordInput integration point. */
export const VIREO_PASSWORD_INPUT_NAME = "VireoPasswordInput";

/** Canonical public slots exposed by VireoPasswordInput, in rendered DOM order. */
export const VIREO_PASSWORD_INPUT_SLOTS = ["root", "visibilityButton"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoPasswordInput. */
export type VireoPasswordInputSlotName = (typeof VIREO_PASSWORD_INPUT_SLOTS)[number];
