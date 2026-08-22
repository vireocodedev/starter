export type UseVireoTransitionPresenceOptions = {
  /** Runs after an exit cycle completes and the retained value has been cleared. */
  onExited?: () => void;
};

export type VireoTransitionPresence<TValue> = {
  /** Whether the transition should currently render its entered state. */
  visible: boolean;
  /** The latest non-null value retained until an active exit completes. */
  renderedValue: TValue | null;
  /** Starts an exit while preserving the rendered value. */
  dismiss: () => void;
  /** Completes the active exit and clears the rendered value. */
  completeExit: () => void;
};
