import { describe, expect, it } from "vitest";
import { decodeDndIdentifier, encodeDndIdentifier } from "./dndIdCodec";

describe("dndIdCodec", () => {
  it("encodes equal JSON identifiers deterministically", () => {
    expect(encodeDndIdentifier({ type: "task", taskId: "42", meta: { b: 2, a: 1 } }, "test")).toBe(
      encodeDndIdentifier({ meta: { a: 1, b: 2 }, taskId: "42", type: "task" }, "test"),
    );
  });

  it("round trips supported structured identifiers", () => {
    const value = { type: "task", taskId: "42", flags: [true, null] };
    expect(decodeDndIdentifier(encodeDndIdentifier(value, "test"))).toEqual(value);
  });

  it("rejects unsupported values and foreign strings", () => {
    expect(() => encodeDndIdentifier({ type: "task", callback: () => undefined } as never, "test")).toThrow(
      /unsupported function/,
    );
    expect(() => decodeDndIdentifier("foreign")).toThrow(/identifier/);
  });
});
