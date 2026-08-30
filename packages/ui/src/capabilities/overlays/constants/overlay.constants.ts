import { type DialogProps } from "@mui/material";
import { VIREO_MOTION_TOKENS } from "@/core/public";

export const DEFAULT_DESKTOP_SIDE_PANEL_MIN_WIDTH = 360;
export const DEFAULT_DESKTOP_SIDE_PANEL_MIN_CONTENT_WIDTH = 420;
export const DEFAULT_DESKTOP_SIDE_PANEL_VIEWPORT_INSET = 48;
export const DOCKED_SIDE_PANEL_TRANSITION_MS = VIREO_MOTION_TOKENS.duration.standard;
export const SIDE_PANEL_WIDTH_CSS_VAR = "--responsive-overlay-side-panel-width";
export const DOCKED_SIDE_PANEL_TRANSITION_EVENT = "responsive-overlay:docked-side-panel-transition";
export const SIDE_PANEL_RESIZE_HANDLE_WIDTH = 6;
export const SIDE_PANEL_RESIZE_HITBOX_WIDTH = 24;
export const SIDE_PANEL_RESIZE_HOVER_OPACITY = 0.35;
export const SIDE_PANEL_RESIZE_ACTIVE_OPACITY = 0.7;
export const SIDE_PANEL_RESIZE_KEYBOARD_STEP = 16;

export type DockedSidePanelTransitionEventDetail = {
  animating: boolean;
};

export const DESKTOP_SIDE_PANEL_WIDTH_BY_MAX_WIDTH: Record<
  Exclude<DialogProps["maxWidth"], undefined | false>,
  number
> = {
  xs: 360,
  sm: 480,
  md: 560,
  lg: 760,
  xl: 960,
};
