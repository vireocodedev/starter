export const APP_SESSION_EXPIRED_EVENT = "app:session-expired";

let sessionExpiryPending = false;
let manualLogoutPending = false;

export function beginManualLogout(): void {
  manualLogoutPending = true;
}

export function cancelManualLogout(): void {
  manualLogoutPending = false;
}

export function notifySessionExpired(): boolean {
  if (manualLogoutPending || sessionExpiryPending) {
    return false;
  }

  sessionExpiryPending = true;
  window.dispatchEvent(new Event(APP_SESSION_EXPIRED_EVENT));
  return true;
}

export function resetSessionExpiryNotification(): void {
  sessionExpiryPending = false;
  manualLogoutPending = false;
}

export function subscribeToSessionExpiry(listener: () => void): () => void {
  window.addEventListener(APP_SESSION_EXPIRED_EVENT, listener);
  return () => window.removeEventListener(APP_SESSION_EXPIRED_EVENT, listener);
}
