import { endpoint, handleBadRequestError, serializeError, type ValidationResult } from "@/utils/apiutils";
import { describe, expect, it, vi } from "vitest";

describe("endpoint", () => {
  it("joins the base and chunks with a leading slash", () => {
    expect(endpoint("api", "users", 1)).toBe("/api/users/1");
  });

  it("strips a leading slash from the base", () => {
    expect(endpoint("/api", "users")).toBe("/api/users");
  });

  it("strips a leading slash from each chunk", () => {
    expect(endpoint("api", "/users", "/1")).toBe("/api/users/1");
  });

  it("returns just the base when no chunks are supplied", () => {
    expect(endpoint("api")).toBe("/api");
  });

  it("returns just the base when the only chunk is empty", () => {
    expect(endpoint("api", "")).toBe("/api");
  });

  it("does not mutate the caller's chunk array", () => {
    const chunks = ["/users", "/1"];
    endpoint("api", ...chunks);
    expect(chunks).toEqual(["/users", "/1"]);
  });
});

describe("handleBadRequestError", () => {
  const validationResult: ValidationResult = {
    status: 400,
    fieldErrors: [{ propertyPath: "name", code: "NotBlank" }],
    globalErrors: [],
  };

  it("invokes the handler for a well-formed 400", () => {
    const handler = vi.fn();
    handleBadRequestError({ status: 400, response: { data: validationResult } }, handler);
    expect(handler).toHaveBeenCalledWith(validationResult);
  });

  it("ignores errors that are not a 400", () => {
    const handler = vi.fn();
    handleBadRequestError({ status: 500, response: { data: validationResult } }, handler);
    expect(handler).not.toHaveBeenCalled();
  });

  it("ignores a 400 whose payload is not a validation result", () => {
    const handler = vi.fn();
    handleBadRequestError({ status: 400, response: { data: { message: "nope" } } }, handler);
    expect(handler).not.toHaveBeenCalled();
  });

  it("ignores a 400 that carries no response body", () => {
    const handler = vi.fn();
    expect(() => handleBadRequestError({ status: 400 }, handler)).not.toThrow();
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("serializeError", () => {
  it("unwraps the non-enumerable fields of a native Error", () => {
    const serialized = serializeError(new Error("boom")) as Record<string, unknown>;
    expect(serialized.name).toBe("Error");
    expect(serialized.message).toBe("boom");
    expect(serialized.stack).toEqual(expect.any(String));
  });

  it("survives JSON.stringify, which a raw Error does not", () => {
    expect(JSON.stringify(new Error("boom"))).toBe("{}");
    expect(JSON.stringify(serializeError(new Error("boom")))).toContain("boom");
  });

  it("forwards the HTTP context of an axios-style error", () => {
    const error = Object.assign(new Error("Request failed"), {
      response: { status: 409, statusText: "Conflict", data: { detail: "duplicate" } },
    });
    const serialized = serializeError(error) as Record<string, unknown>;
    expect(serialized.response).toEqual({
      status: 409,
      statusText: "Conflict",
      data: { detail: "duplicate" },
    });
  });

  it("omits the response key when the error has no HTTP context", () => {
    expect(serializeError(new Error("boom"))).not.toHaveProperty("response");
  });

  it("recurses into the cause chain", () => {
    const error = new Error("outer", { cause: new Error("inner") });
    const serialized = serializeError(error) as Record<string, Record<string, unknown>>;
    expect(serialized.cause.message).toBe("inner");
  });

  it("returns non-Error values untouched", () => {
    expect(serializeError("plain string")).toBe("plain string");
    expect(serializeError({ code: 42 })).toEqual({ code: 42 });
    expect(serializeError(null)).toBeNull();
  });
});
