export const NAV_WIDTH_CSS_VAR = "--app-desktop-nav-width";

export const NAV_COLLAPSED_WIDTH = 80;
export const NAV_DEFAULT_EXPANDED_WIDTH = 294;
export const NAV_MIN_EXPANDED_WIDTH = 180;
export const NAV_MAX_EXPANDED_WIDTH = 420;
export const NAV_COLLAPSE_TRIGGER_WIDTH = 120;

export const NAV_RESIZE_HANDLE_WIDTH = 6;
export const NAV_RESIZE_HITBOX_WIDTH = 14;
export const NAV_RESIZE_HOVER_OPACITY = 0.35;
export const NAV_RESIZE_ACTIVE_OPACITY = 0.7;

export type EnsureValidNavWidthOptions = {
  maxWidth?: number;
};

export function ensureValidNavWidth(width: number, options: EnsureValidNavWidthOptions = {}): number {
  if (!Number.isFinite(width)) {
    return NAV_DEFAULT_EXPANDED_WIDTH;
  }

  if (width <= NAV_COLLAPSED_WIDTH) {
    return NAV_DEFAULT_EXPANDED_WIDTH;
  }

  const maxWidth = options.maxWidth ?? NAV_MAX_EXPANDED_WIDTH;
  const effectiveMaxWidth = Math.max(NAV_MIN_EXPANDED_WIDTH, Math.min(maxWidth, NAV_MAX_EXPANDED_WIDTH));

  return Math.max(NAV_MIN_EXPANDED_WIDTH, Math.min(width, effectiveMaxWidth));
}
