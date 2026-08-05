/**
 * WebRTC video streaming, isolated behind its own entry point.
 *
 * `RgoVideoStreamPlayer` imports `ovenplayer`, a player runtime an order of
 * magnitude larger than any other dependency in this package. While the
 * component was re-exported from the root barrel, every consumer pulled that
 * runtime into its module graph whether or not it rendered a stream — and a
 * bundler cannot prove the import away, because both the player and the
 * component's stylesheet have side effects.
 *
 * Moving it here makes the cost opt-in: `ovenplayer` is now resolved only by
 * code that imports this subpath. The component is otherwise unchanged.
 *
 * This entry point is **not** worker-safe. It evaluates React, MUI and DOM
 * globals, like the root barrel does.
 */

export {
  RgoVideoStreamPlayer,
  type RgoVideoStreamPlayerProps,
} from "@/components/data-display/RgoVideoStreamPlayer/RgoVideoStreamPlayer";
