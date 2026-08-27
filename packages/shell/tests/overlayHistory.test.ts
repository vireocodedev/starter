import {
  createOverlayHistoryRegistry,
  readOverlayStack,
  resolveOverlayHistoryAction,
  withOverlayStack,
} from "@vireocodedev/shell";
import { describe, expect, it, vi } from "vitest";

describe("overlay history", () => {
  it("preserves consumer location state while reading and writing the synthetic stack", () => {
    const state = withOverlayStack({ consumer: 42 }, ["drawer", "dialog"]);
    expect(readOverlayStack(state)).toEqual(["drawer", "dialog"]);
    expect(withOverlayStack(state, [])).toEqual({ consumer: 42 });
    expect(readOverlayStack({ __starterShellOverlayStack: ["valid", 42] })).toEqual([]);
  });

  it("resolves one deterministic history operation per reconciliation pass", () => {
    expect(
      resolveOverlayHistoryAction({
        desired: ["drawer"],
        actual: [],
        previousActual: [],
        navigationType: "PUSH",
        locationChanged: false,
        urlChanged: false,
      }),
    ).toEqual({ type: "push", stack: ["drawer"] });

    expect(
      resolveOverlayHistoryAction({
        desired: ["drawer", "dialog"],
        actual: ["drawer"],
        previousActual: ["drawer", "dialog"],
        navigationType: "POP",
        locationChanged: true,
        urlChanged: false,
      }),
    ).toEqual({ type: "requestClose", id: "dialog" });
  });

  it("keeps registry state instance-scoped and observable", () => {
    const first = createOverlayHistoryRegistry();
    const second = createOverlayHistoryRegistry();
    const listener = vi.fn();
    first.subscribe(listener);
    const unregister = first.register({ id: "drawer", requestClose: vi.fn() });

    expect(first.getSnapshot().map(entry => entry.id)).toEqual(["drawer"]);
    expect(second.getSnapshot()).toEqual([]);
    unregister();
    expect(first.getSnapshot()).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
