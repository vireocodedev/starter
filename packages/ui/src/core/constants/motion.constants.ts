/**
 * Shared semantic motion values for Vireo components and consuming applications.
 *
 * Direct manipulation should remain immediate. Use the longer values only when
 * motion communicates a surface or navigation relationship.
 */
export const VIREO_MOTION_TOKENS = {
  duration: {
    instant: 0,
    micro: 110,
    standard: 180,
    enter: 210,
    exit: 150,
    emphasized: 270,
  },
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    enter: "cubic-bezier(0, 0, 0, 1)",
    exit: "cubic-bezier(0.3, 0, 1, 1)",
  },
  distance: {
    micro: 4,
    component: 8,
    surface: 16,
  },
  scale: {
    pressed: 0.98,
  },
} as const;

export type VireoMotionTokens = typeof VIREO_MOTION_TOKENS;
