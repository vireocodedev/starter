export type VireoFullscreen = {
  /** Whether the target's owner document exposes the standard Fullscreen API. */
  isSupported: boolean;
  /** Whether the target itself is the current fullscreen element. */
  isFullscreen: boolean;
  /** The target owner document's current fullscreen element, including external owners. */
  fullscreenElement: Element | null;
  /** Requests fullscreen for the target. */
  enterFullscreen: (options?: FullscreenOptions) => Promise<void>;
  /** Exits fullscreen only when the target owns it. */
  exitFullscreen: () => Promise<void>;
  /** Enters or exits fullscreen according to whether the target owns it. */
  toggleFullscreen: (options?: FullscreenOptions) => Promise<void>;
};
