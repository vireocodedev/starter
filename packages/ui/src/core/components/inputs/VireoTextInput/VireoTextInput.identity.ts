import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoTextInput integration point. */
export const VIREO_TEXT_INPUT_NAME = "VireoTextInput";

/** Canonical public slots exposed by VireoTextInput, in rendered DOM order. */
export const VIREO_TEXT_INPUT_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoTextInput. */
export type VireoTextInputSlotName = (typeof VIREO_TEXT_INPUT_SLOTS)[number];
