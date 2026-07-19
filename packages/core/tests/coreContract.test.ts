import {
  assertLocalRoutePath,
  getRequiredParamNames,
  joinRoutePattern,
  normalizeRoutePath,
} from "@/sitemap/routePath.utils";
import { describe, expect, it } from "vitest";

/**
 * Contract guard for the headless route-path helpers. The MUI shell/nav
 * components are validated by consuming apps; these pure routing utilities are
 * the dependency-light surface worth pinning here.
 */
describe("starter-core routePath contract", () => {
  it("normalizes leading/trailing slashes", () => {
    expect(normalizeRoutePath("/foo/bar/")).toBe("foo/bar");
    expect(normalizeRoutePath("baz")).toBe("baz");
  });

  it("joins parent and child into an absolute pattern", () => {
    expect(joinRoutePattern("/users", "/:id")).toBe("/users/:id");
    expect(joinRoutePattern("", "")).toBe("/");
  });

  it("extracts required path param names", () => {
    expect(getRequiredParamNames("/users/:id/posts/:postId")).toEqual(["id", "postId"]);
    expect(getRequiredParamNames("/static")).toEqual([]);
  });

  it("rejects absolute local route segments", () => {
    expect(() => assertLocalRoutePath("/nope", "node")).toThrow();
    expect(() => assertLocalRoutePath("ok", "node")).not.toThrow();
  });
});
