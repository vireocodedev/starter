import { getAppOnlineStatus, subscribeToAppNetworkStatus } from "@vireocodedev/infrastructure/network-status";
import React from "react";

/**
 * Subscribes a React owner to the browser's online/offline status.
 *
 * The browser signal is a connectivity hint, not proof that an application
 * endpoint is reachable. Use Infrastructure's connectivity state when a
 * heartbeat-backed health decision is required.
 */
export function useVireoOnlineStatus(): boolean {
  return React.useSyncExternalStore(subscribeToAppNetworkStatus, getAppOnlineStatus, () => true);
}
