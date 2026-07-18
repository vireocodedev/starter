import { type AppWindowControlsOverlayState } from "@/shell/hooks/useWindowControlsOverlay";
import { NAV_COLLAPSED_WIDTH } from "@/shell/layout/layoutNav.constants";

export function resolveWindowControlsOverlayDesktopNavWidth({
  desktopNavWidth,
  isMobile,
  windowControlsOverlay,
}: {
  desktopNavWidth: number;
  isMobile: boolean;
  windowControlsOverlay: AppWindowControlsOverlayState;
}): number {
  if (isMobile || !windowControlsOverlay.visible || windowControlsOverlay.leftInset === 0) {
    return desktopNavWidth;
  }

  // macOS places its system controls on the left. Preserve one complete
  // collapsed-nav-width content column after that reserved area.
  return Math.max(desktopNavWidth, windowControlsOverlay.leftInset + NAV_COLLAPSED_WIDTH);
}
