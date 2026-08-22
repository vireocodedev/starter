import React from "react";
import type { UseVireoDebouncedCallbackOptions, VireoDebouncedCallback } from "./useVireoDebouncedCallback.types";

export type { UseVireoDebouncedCallbackOptions, VireoDebouncedCallback } from "./useVireoDebouncedCallback.types";

/**
 * Creates a trailing debounced callback with explicit cancellation and flushing controls.
 */
export function useVireoDebouncedCallback<TArgs extends unknown[], TResult>(
  callback: (...args: TArgs) => TResult,
  { delayMs }: UseVireoDebouncedCallbackOptions,
): VireoDebouncedCallback<TArgs, TResult> {
  if (!Number.isFinite(delayMs) || delayMs < 0) {
    throw new RangeError("useVireoDebouncedCallback delayMs must be a finite non-negative number.");
  }

  const callbackRef = React.useRef(callback);
  const argsRef = React.useRef<TArgs | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  callbackRef.current = callback;

  const cancel = React.useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    argsRef.current = null;
  }, []);

  const run = React.useCallback(
    (...args: TArgs) => {
      cancel();
      argsRef.current = args;
      timeoutRef.current = setTimeout(() => {
        const pendingArgs = argsRef.current;
        timeoutRef.current = null;
        argsRef.current = null;
        if (pendingArgs !== null) callbackRef.current(...pendingArgs);
      }, delayMs);
    },
    [cancel, delayMs],
  );

  const flush = React.useCallback((): TResult | undefined => {
    const pendingArgs = argsRef.current;
    if (pendingArgs === null) return undefined;

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    argsRef.current = null;
    return callbackRef.current(...pendingArgs);
  }, []);

  const isPending = React.useCallback(() => argsRef.current !== null, []);

  React.useEffect(() => cancel, [cancel, delayMs]);

  return React.useMemo(() => ({ run, cancel, flush, isPending }), [cancel, flush, isPending, run]);
}
