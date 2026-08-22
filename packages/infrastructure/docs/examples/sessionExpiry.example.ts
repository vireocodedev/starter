import { createSessionExpiryChannel } from "@vireocodedev/starter-infrastructure";

export function runSessionExpiryExample() {
  const channel = createSessionExpiryChannel();
  let redirectCount = 0;
  channel.subscribe(() => {
    redirectCount += 1;
  });

  const firstNotification = channel.notifySessionExpired();
  const duplicateNotification = channel.notifySessionExpired();
  channel.reset();
  channel.beginManualLogout();
  const duringManualLogout = channel.notifySessionExpired();

  return {
    firstNotification,
    duplicateNotification,
    duringManualLogout,
    redirectCount,
    state: channel.getState(),
  };
}
