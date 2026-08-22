import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoStopwatch integration point. */
export const VIREO_STOPWATCH_NAME = "VireoStopwatch";

/** Canonical public slots exposed by VireoStopwatch, in rendered DOM order. */
export const VIREO_STOPWATCH_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoStopwatch. */
export type VireoStopwatchSlotName = (typeof VIREO_STOPWATCH_SLOTS)[number];
