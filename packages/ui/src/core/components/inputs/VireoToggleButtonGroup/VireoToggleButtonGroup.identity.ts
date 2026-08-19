import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoToggleButtonGroup integration point. */
export const VIREO_TOGGLE_BUTTON_GROUP_NAME = "VireoToggleButtonGroup";

/** Canonical public slots exposed by VireoToggleButtonGroup, in rendered DOM order. */
export const VIREO_TOGGLE_BUTTON_GROUP_SLOTS = [
  "root",
  "group",
  "option",
  "clearButton",
  "helperText",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoToggleButtonGroup. */
export type VireoToggleButtonGroupSlotName = (typeof VIREO_TOGGLE_BUTTON_GROUP_SLOTS)[number];
