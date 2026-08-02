import React from "react";

export type UseRgoFadePresenceConfig<T> = {
  value: T | null;
  onExited: () => void;
};

/**
 * Manages the visible/fade lifecycle for a nullable value.
 *
 * - Fades in when `value` becomes non-null.
 * - Exposes `onDismiss()` to trigger a fade-out.
 * - Keeps `lastValue` populated during the fade-out so content can still render.
 * - Calls `onExited` once the transition fully completes (wire to MUI Fade's `onExited`).
 */
export function useRgoFadePresence<T>({ value, onExited }: UseRgoFadePresenceConfig<T>) {
  const [visible, setVisible] = React.useState(false);

  const lastValue = React.useRef(value);
  if (value) lastValue.current = value;

  React.useEffect(() => {
    if (value) setVisible(true);
  }, [value]);

  const onDismiss = React.useCallback(() => setVisible(false), []);

  const handleExited = React.useCallback(() => {
    lastValue.current = null;
    onExited();
  }, [onExited]);

  return { visible, lastValue: lastValue.current, onDismiss, handleExited };
}
