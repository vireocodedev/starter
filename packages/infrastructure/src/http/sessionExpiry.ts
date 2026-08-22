export type SessionExpiryState = Readonly<{
  manualLogoutPending: boolean;
  notificationPending: boolean;
}>;

export type SessionExpiryChannelOptions = {
  onListenerError?: (error: unknown) => void;
};

export type SessionExpiryChannel = {
  beginManualLogout: () => void;
  cancelManualLogout: () => void;
  getState: () => SessionExpiryState;
  notifySessionExpired: () => boolean;
  reset: () => void;
  subscribe: (listener: () => void) => () => void;
};

/**
 * Creates an isolated session-expiry coordination channel.
 *
 * Applications own the instance and decide how a notification changes routing
 * or authentication state. Infrastructure only deduplicates notifications and
 * suppresses expiry handling while an intentional logout is pending.
 */
export function createSessionExpiryChannel(options: SessionExpiryChannelOptions = {}): SessionExpiryChannel {
  const listeners = new Set<() => void>();
  let manualLogoutPending = false;
  let notificationPending = false;

  return {
    beginManualLogout() {
      manualLogoutPending = true;
    },
    cancelManualLogout() {
      manualLogoutPending = false;
    },
    getState() {
      return { manualLogoutPending, notificationPending };
    },
    notifySessionExpired() {
      if (manualLogoutPending || notificationPending) {
        return false;
      }

      notificationPending = true;
      [...listeners].forEach(listener => {
        try {
          listener();
        } catch (error) {
          options.onListenerError?.(error);
        }
      });
      return true;
    },
    reset() {
      manualLogoutPending = false;
      notificationPending = false;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
