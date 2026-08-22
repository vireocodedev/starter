import React from "react";
import type { UseVireoTransitionPresenceOptions, VireoTransitionPresence } from "./useVireoTransitionPresence.types";

export type { UseVireoTransitionPresenceOptions, VireoTransitionPresence } from "./useVireoTransitionPresence.types";

type TransitionPresenceState<TValue> = {
  visible: boolean;
  renderedValue: TValue | null;
  exitPending: boolean;
};

const useBrowserLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/**
 * Retains a non-null value while an external transition finishes its exit.
 */
export function useVireoTransitionPresence<TValue>(
  value: TValue | null,
  { onExited }: UseVireoTransitionPresenceOptions = {},
): VireoTransitionPresence<TValue> {
  const initialState = React.useRef<TransitionPresenceState<TValue>>({
    visible: value !== null,
    renderedValue: value,
    exitPending: false,
  });
  const [state, setState] = React.useState(initialState.current);
  const stateRef = React.useRef(state);
  const latestNonNullValueRef = React.useRef<TValue | null>(value);
  const onExitedRef = React.useRef(onExited);
  onExitedRef.current = onExited;
  if (value !== null) latestNonNullValueRef.current = value;

  const commitState = React.useCallback((nextState: TransitionPresenceState<TValue>) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  useBrowserLayoutEffect(() => {
    const currentState = stateRef.current;

    if (value !== null) {
      if (!currentState.visible || currentState.exitPending) {
        commitState({ visible: true, renderedValue: value, exitPending: false });
      }
      return;
    }

    if (currentState.visible && currentState.renderedValue !== null) {
      commitState({
        visible: false,
        renderedValue: latestNonNullValueRef.current,
        exitPending: true,
      });
    }
  }, [commitState, value]);

  const dismiss = React.useCallback(() => {
    const currentState = stateRef.current;
    if (!currentState.visible || currentState.renderedValue === null) return;

    commitState({
      visible: false,
      renderedValue: latestNonNullValueRef.current,
      exitPending: true,
    });
  }, [commitState]);

  const completeExit = React.useCallback(() => {
    const currentState = stateRef.current;
    if (!currentState.exitPending || currentState.visible) return;

    commitState({ visible: false, renderedValue: null, exitPending: false });
    onExitedRef.current?.();
  }, [commitState]);

  const renderedValue = state.visible && value !== null ? value : state.renderedValue;

  return React.useMemo(
    () => ({ visible: state.visible, renderedValue, dismiss, completeExit }),
    [completeExit, dismiss, renderedValue, state.visible],
  );
}
