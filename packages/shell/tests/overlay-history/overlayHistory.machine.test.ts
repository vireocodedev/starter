import {
  getCommonPrefixLength,
  readOverlayStack,
  resolveOverlayHistoryAction,
  withOverlayStack,
} from "@/overlay-history/overlayHistory.machine";
import { OVERLAY_HISTORY_STATE_KEY, type OverlayHistoryResolveInput } from "@/overlay-history/overlayHistory.types";
import { describe, expect, it } from "vitest";

function input(overrides: Partial<OverlayHistoryResolveInput> = {}): OverlayHistoryResolveInput {
  return {
    desired: [],
    actual: [],
    previousActual: [],
    navigationType: "PUSH",
    locationChanged: false,
    urlChanged: false,
    ...overrides,
  };
}

describe("overlay history location state", () => {
  it("reads an empty stack from unusable state", () => {
    expect(readOverlayStack(null)).toEqual([]);
    expect(readOverlayStack("nope")).toEqual([]);
    expect(readOverlayStack({})).toEqual([]);
    expect(readOverlayStack({ [OVERLAY_HISTORY_STATE_KEY]: [1, 2] })).toEqual([]);
  });

  it("reads a stack of entry ids", () => {
    expect(readOverlayStack({ [OVERLAY_HISTORY_STATE_KEY]: ["a", "b"] })).toEqual(["a", "b"]);
  });

  it("preserves app-provided state when writing the stack", () => {
    expect(withOverlayStack({ from: "table" }, ["a"])).toEqual({
      from: "table",
      [OVERLAY_HISTORY_STATE_KEY]: ["a"],
    });
  });

  it("removes the stack key when the stack is empty", () => {
    expect(withOverlayStack({ from: "table", [OVERLAY_HISTORY_STATE_KEY]: ["a"] }, [])).toEqual({ from: "table" });
  });

  it("computes the common prefix length", () => {
    expect(getCommonPrefixLength(["a", "b", "c"], ["a", "b"])).toBe(2);
    expect(getCommonPrefixLength(["a"], ["b"])).toBe(0);
    expect(getCommonPrefixLength([], ["a"])).toBe(0);
  });
});

describe("resolveOverlayHistoryAction", () => {
  it("does nothing when the stack already matches", () => {
    expect(resolveOverlayHistoryAction(input({ desired: ["a"], actual: ["a"] }))).toEqual({ type: "idle" });
  });

  it("pushes an entry for a newly opened overlay", () => {
    expect(resolveOverlayHistoryAction(input({ desired: ["a"] }))).toEqual({ type: "push", stack: ["a"] });
  });

  it("pushes stacked layers one at a time", () => {
    expect(resolveOverlayHistoryAction(input({ desired: ["a", "b"], actual: ["a"] }))).toEqual({
      type: "push",
      stack: ["a", "b"],
    });
  });

  it("consumes the synthetic entry left behind by a non-history close", () => {
    expect(resolveOverlayHistoryAction(input({ desired: [], actual: ["a"] }))).toEqual({ type: "consume" });
  });

  it("consumes surplus entries one at a time", () => {
    expect(resolveOverlayHistoryAction(input({ desired: ["a"], actual: ["a", "b"] }))).toEqual({ type: "consume" });
  });

  it("requests a close for the topmost layer popped by a back press", () => {
    expect(
      resolveOverlayHistoryAction(
        input({
          desired: ["a", "b"],
          actual: ["a"],
          previousActual: ["a", "b"],
          navigationType: "POP",
          locationChanged: true,
        }),
      ),
    ).toEqual({ type: "requestClose", id: "b" });
  });

  it("closes only one layer when several entries are popped at once", () => {
    expect(
      resolveOverlayHistoryAction(
        input({
          desired: ["a", "b", "c"],
          actual: [],
          previousActual: ["a", "b", "c"],
          navigationType: "POP",
          locationChanged: true,
        }),
      ),
    ).toEqual({ type: "requestClose", id: "c" });
  });

  it("re-pushes the popped entry when the overlay refused to close", () => {
    // Second pass after `requestClose`: the location change has been consumed
    // (locationChanged is false) and the overlay is still open, so its entry is
    // restored and a further back press is guarded again.
    expect(
      resolveOverlayHistoryAction(input({ desired: ["a"], actual: [], previousActual: [], navigationType: "POP" })),
    ).toEqual({ type: "push", stack: ["a"] });
  });

  it("does not request a close for entries whose overlay already closed", () => {
    expect(
      resolveOverlayHistoryAction(
        input({ desired: [], actual: [], previousActual: ["a"], navigationType: "POP", locationChanged: true }),
      ),
    ).toEqual({ type: "idle" });
  });

  it("stays idle while the route itself is changing", () => {
    expect(
      resolveOverlayHistoryAction(
        input({ desired: ["a"], actual: [], previousActual: ["a"], locationChanged: true, urlChanged: true }),
      ),
    ).toEqual({ type: "idle" });
  });
});
