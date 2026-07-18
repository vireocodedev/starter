import React from "react";

export class AppOfflineError extends Error {
  constructor() {
    super("The application is offline.");
    this.name = "AppOfflineError";
  }
}

export function isAppOfflineError(error: unknown): error is AppOfflineError {
  return error instanceof AppOfflineError || (error instanceof Error && error.name === "AppOfflineError");
}

export function getAppOnlineStatus(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

function subscribeToAppNetworkStatus(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);

  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

export function useAppOnlineStatus(): boolean {
  return React.useSyncExternalStore(subscribeToAppNetworkStatus, getAppOnlineStatus, () => true);
}
