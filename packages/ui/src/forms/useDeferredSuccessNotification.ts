import React from "react";

/** Coordinates success feedback that must wait for an exit transition. */
export function useDeferredSuccessNotification(enabled: boolean) {
  const pendingNotificationRef = React.useRef<(() => void) | null>(null);

  const scheduleSuccessNotification = React.useCallback(
    (showNotification: () => void) => {
      if (enabled) {
        pendingNotificationRef.current = showNotification;
        return;
      }

      showNotification();
    },
    [enabled],
  );

  const clearSuccessNotification = React.useCallback(() => {
    pendingNotificationRef.current = null;
  }, []);

  const showSuccessNotification = React.useCallback(() => {
    const showNotification = pendingNotificationRef.current;
    pendingNotificationRef.current = null;
    showNotification?.();
  }, []);

  return React.useMemo(
    () => ({ scheduleSuccessNotification, clearSuccessNotification, showSuccessNotification }),
    [clearSuccessNotification, scheduleSuccessNotification, showSuccessNotification],
  );
}
