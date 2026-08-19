import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoSlidingScreenStack integration point. */
export const VIREO_SLIDING_SCREEN_STACK_NAME = "VireoSlidingScreenStack";

/** Canonical public slots exposed by VireoSlidingScreenStack, in rendered DOM order. */
export const VIREO_SLIDING_SCREEN_STACK_SLOTS = ["root", "track", "screen"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoSlidingScreenStack. */
export type VireoSlidingScreenStackSlotName = (typeof VIREO_SLIDING_SCREEN_STACK_SLOTS)[number];
