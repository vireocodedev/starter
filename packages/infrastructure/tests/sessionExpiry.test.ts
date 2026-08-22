import { createSessionExpiryChannel } from "@/index";
import { describe, expect, it, vi } from "vitest";

describe("createSessionExpiryChannel", () => {
  it("notifies subscribers once until reset", () => {
    const channel = createSessionExpiryChannel();
    const listener = vi.fn();
    const unsubscribe = channel.subscribe(listener);

    expect(channel.notifySessionExpired()).toBe(true);
    expect(channel.notifySessionExpired()).toBe(false);
    expect(listener).toHaveBeenCalledOnce();
    expect(channel.getState()).toEqual({ manualLogoutPending: false, notificationPending: true });

    channel.reset();
    expect(channel.notifySessionExpired()).toBe(true);
    unsubscribe();
    channel.reset();
    expect(channel.notifySessionExpired()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("suppresses expiry while an intentional logout is pending", () => {
    const channel = createSessionExpiryChannel();
    const listener = vi.fn();
    channel.subscribe(listener);

    channel.beginManualLogout();
    expect(channel.getState().manualLogoutPending).toBe(true);
    expect(channel.notifySessionExpired()).toBe(false);
    expect(listener).not.toHaveBeenCalled();

    channel.cancelManualLogout();
    expect(channel.notifySessionExpired()).toBe(true);
  });

  it("isolates channels and reports subscriber failures without skipping later listeners", () => {
    const onListenerError = vi.fn();
    const first = createSessionExpiryChannel({ onListenerError });
    const second = createSessionExpiryChannel();
    const survivingListener = vi.fn();
    const failure = new Error("listener failed");

    first.subscribe(() => {
      throw failure;
    });
    first.subscribe(survivingListener);

    expect(first.notifySessionExpired()).toBe(true);
    expect(onListenerError).toHaveBeenCalledWith(failure);
    expect(survivingListener).toHaveBeenCalledOnce();
    expect(second.getState().notificationPending).toBe(false);
  });
});
