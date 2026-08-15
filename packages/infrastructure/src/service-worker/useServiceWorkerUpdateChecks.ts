import React from "react";

export type ServiceWorkerUpdateCheckOptions = {
  intervalMs: number;
  checkWhenVisible?: boolean;
};

/** Schedules update checks for an already registered worker without owning registration or update UI. */
export function useServiceWorkerUpdateChecks({
  intervalMs,
  checkWhenVisible = true,
}: ServiceWorkerUpdateCheckOptions): void {
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let disposed = false;
    const checkForUpdate = () => {
      void navigator.serviceWorker.ready
        .then(registration => {
          if (!disposed) {
            return registration.update();
          }
        })
        .catch(() => {
          // A transient browser/SW failure should not affect the running application.
        });
    };

    const intervalId = window.setInterval(checkForUpdate, intervalMs);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkForUpdate();
      }
    };

    if (checkWhenVisible) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      disposed = true;
      window.clearInterval(intervalId);

      if (checkWhenVisible) {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, [checkWhenVisible, intervalMs]);
}
