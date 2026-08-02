import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_DISMISS_DELAY_MS = 10_000;
const DEFAULT_TICK_FREQUENCY_MS = 25;

export type UseAutoDismissProps = {
  onDismiss: () => void;
  dismissDelayMs?: number;
  tickFrequencyMs?: number;
  /** Start the dismiss timer immediately on mount. */
  autoStart?: boolean;
  /** Reactively control whether the timer is active. When toggled to `true` the timer starts; when `false` it is cleared. Leave `undefined` for imperative-only control. */
  enabled?: boolean;
  /** Reactively pause/resume the timer. When `true` the timer is paused (and resumes where it left off when set back to `false`). Leave `undefined` for imperative-only control. */
  paused?: boolean;
};

export function useRgoAutoDismiss({
  onDismiss,
  dismissDelayMs = DEFAULT_DISMISS_DELAY_MS,
  tickFrequencyMs = DEFAULT_TICK_FREQUENCY_MS,
  autoStart = false,
  enabled,
  paused,
}: UseAutoDismissProps) {
  const [progress, setProgress] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerStartRef = useRef<number | null>(null);
  const elapsedOnPauseRef = useRef<number>(0);
  const isPausedRef = useRef(false);

  // Always call the latest onDismiss without re-creating timers
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startProgressInterval = useCallback(
    (alreadyElapsed: number) => {
      intervalRef.current = setInterval(() => {
        if (timerStartRef.current === null) return;
        const elapsed = Date.now() - timerStartRef.current + alreadyElapsed;
        const remaining = Math.max(0, 100 - (elapsed / dismissDelayMs) * 100);
        setProgress(remaining);
        if (remaining <= 0 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, tickFrequencyMs);
    },
    [dismissDelayMs, tickFrequencyMs],
  );

  const clearDismissTimer = useCallback(() => {
    clearTimers();
    timerStartRef.current = null;
    elapsedOnPauseRef.current = 0;
    isPausedRef.current = false;
    setProgress(null);
  }, [clearTimers]);

  const startDismissTimer = useCallback(() => {
    clearDismissTimer();
    timerStartRef.current = Date.now();
    elapsedOnPauseRef.current = 0;
    isPausedRef.current = false;
    setProgress(100);
    startProgressInterval(0);
    timerRef.current = setTimeout(() => onDismissRef.current(), dismissDelayMs);
  }, [clearDismissTimer, dismissDelayMs, startProgressInterval]);

  const pauseDismissTimer = useCallback(() => {
    if (timerStartRef.current === null) return;
    elapsedOnPauseRef.current += Date.now() - timerStartRef.current;
    clearTimers();
    timerStartRef.current = null;
    isPausedRef.current = true;
  }, [clearTimers]);

  const resumeDismissTimer = useCallback(() => {
    // Only resume if the timer was explicitly paused
    if (!isPausedRef.current) return;
    isPausedRef.current = false;

    const remainingMs = Math.max(0, dismissDelayMs - elapsedOnPauseRef.current);
    if (remainingMs <= 0) {
      clearDismissTimer();
      onDismissRef.current();
      return;
    }

    timerStartRef.current = Date.now();
    startProgressInterval(elapsedOnPauseRef.current);
    timerRef.current = setTimeout(() => onDismissRef.current(), remainingMs);
  }, [dismissDelayMs, startProgressInterval, clearDismissTimer]);

  // Auto-start on mount
  useEffect(() => {
    if (autoStart) startDismissTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reactive enabled control
  useEffect(() => {
    if (enabled === undefined) return;
    if (enabled) startDismissTimer();
    else clearDismissTimer();
  }, [enabled, startDismissTimer, clearDismissTimer]);

  // Reactive paused control
  useEffect(() => {
    if (paused === undefined) return;
    if (paused) pauseDismissTimer();
    else resumeDismissTimer();
  }, [paused, pauseDismissTimer, resumeDismissTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearDismissTimer();
  }, [clearDismissTimer]);

  return { startDismissTimer, clearDismissTimer, pauseDismissTimer, resumeDismissTimer, progress };
}
