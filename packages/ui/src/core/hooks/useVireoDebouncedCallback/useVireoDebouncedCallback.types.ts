export type UseVireoDebouncedCallbackOptions = {
  /** Delay after the latest invocation before the callback runs. */
  delayMs: number;
};

export type VireoDebouncedCallback<TArgs extends unknown[], TResult> = {
  /** Schedule the callback with the latest arguments. */
  run: (...args: TArgs) => void;
  /** Cancel the currently pending invocation. */
  cancel: () => void;
  /** Immediately execute and clear the pending invocation, if one exists. */
  flush: () => TResult | undefined;
  /** Read whether an invocation is currently pending without causing React renders. */
  isPending: () => boolean;
};
