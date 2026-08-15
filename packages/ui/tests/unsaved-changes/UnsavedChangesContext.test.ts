import { createUnsavedChangesRegistry } from "@/unsaved-changes/UnsavedChangesContext";
import { describe, expect, it, vi } from "vitest";

describe("createUnsavedChangesRegistry", () => {
  it("reports dirty and busy state for hierarchical scopes", () => {
    const registry = createUnsavedChangesRegistry();

    registry.upsertRegistration({ id: "invoice", scopeId: "invoice", dirty: true, busy: false });
    registry.upsertRegistration({ id: "buyer", scopeId: "invoice/buyer", dirty: true, busy: true });
    registry.upsertRegistration({ id: "clean", scopeId: "settings", dirty: false, busy: true });

    expect(registry.getStatus(null)).toEqual({ dirty: true, busy: true });
    expect(registry.getStatus("invoice")).toEqual({ dirty: true, busy: true });
    expect(registry.getStatus("invoice/buyer")).toEqual({ dirty: true, busy: true });
    expect(registry.getStatus("settings")).toEqual({ dirty: false, busy: false });
    expect(registry.getStatus("missing")).toEqual({ dirty: false, busy: false });
  });

  it("publishes immutable snapshots only when registrations change", () => {
    const registry = createUnsavedChangesRegistry();
    const listener = vi.fn();
    const unsubscribe = registry.subscribe(listener);
    const registration = { id: "form", scopeId: "invoice", dirty: true, busy: false };

    registry.upsertRegistration(registration);
    const firstSnapshot = registry.getSnapshot();
    registry.upsertRegistration({ ...registration });
    expect(listener).toHaveBeenCalledOnce();
    expect(registry.getSnapshot()).toBe(firstSnapshot);

    registry.removeRegistration("missing");
    expect(listener).toHaveBeenCalledOnce();

    registry.removeRegistration("form");
    expect(listener).toHaveBeenCalledTimes(2);
    expect(registry.getSnapshot()).not.toBe(firstSnapshot);

    unsubscribe();
    registry.upsertRegistration(registration);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("keeps navigation bypassed until synchronous, nested, and asynchronous actions settle", async () => {
    const registry = createUnsavedChangesRegistry();

    registry.runWithoutNavigationBlock(() => {
      expect(registry.isNavigationBlockBypassed()).toBe(true);
      registry.runWithoutNavigationBlock(() => {
        expect(registry.isNavigationBlockBypassed()).toBe(true);
      });
      expect(registry.isNavigationBlockBypassed()).toBe(true);
    });
    expect(registry.isNavigationBlockBypassed()).toBe(false);

    let resolveAction: (() => void) | undefined;
    const action = registry.runWithoutNavigationBlock(
      () =>
        new Promise<void>(resolve => {
          resolveAction = resolve;
        }),
    );
    expect(registry.isNavigationBlockBypassed()).toBe(true);
    resolveAction?.();
    await action;
    expect(registry.isNavigationBlockBypassed()).toBe(false);
  });

  it("releases the navigation bypass when an action throws", () => {
    const registry = createUnsavedChangesRegistry();

    expect(() =>
      registry.runWithoutNavigationBlock(() => {
        throw new Error("failed");
      }),
    ).toThrow("failed");
    expect(registry.isNavigationBlockBypassed()).toBe(false);
  });
});
