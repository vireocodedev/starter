import { createAuthRedirectState, isSafeInternalPath, resolvePostLoginPath } from "@vireocodedev/shell";
import { describe, expect, it } from "vitest";

describe("authentication redirects", () => {
  it("preserves a safe internal return location without a router type", () => {
    expect(
      createAuthRedirectState({ pathname: "/customers/42", search: "?tab=history", hash: "#latest" }, "/login"),
    ).toEqual({ from: "/customers/42?tab=history#latest" });
    expect(createAuthRedirectState({ pathname: "/login" }, "/login")).toBeUndefined();
  });

  it("fails closed for external and malformed redirect state", () => {
    expect(isSafeInternalPath("/customers")).toBe(true);
    expect(isSafeInternalPath("//attacker.example/path")).toBe(false);
    expect(isSafeInternalPath("/safe\\evil")).toBe(false);
    expect(resolvePostLoginPath({ from: "https://attacker.example" }, "/")).toBe("/");
    expect(resolvePostLoginPath({ from: "/customers" }, "/")).toBe("/customers");
  });
});
