import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoSnack integration point. */
export const VIREO_SNACK_NAME = "VireoSnack";

/** Canonical public slots exposed by VireoSnack, in rendered DOM order. */
export const VIREO_SNACK_SLOTS = [
  "root",
  "startAdornment",
  "message",
  "endAdornment",
] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoSnack. */
export type VireoSnackSlotName = (typeof VIREO_SNACK_SLOTS)[number];
