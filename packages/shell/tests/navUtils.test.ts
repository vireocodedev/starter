import { type NavEntry } from "@/shell/layout/nav/nav.types";
import { compactNavEntries } from "@/shell/layout/nav/nav.utils";
import { describe, expect, it, vi } from "vitest";

vi.mock("@vireocodedev/starter-ui", () => ({ VireoIcon: () => null }));

/**
 * `compactNavEntries` is what stops a permission-filtered nav from rendering
 * empty section headers and stacked dividers. Every case here is reachable by
 * hiding entries a user cannot access.
 */

const item = (label: string): NavEntry => ({
  type: "item",
  label: () => label,
  icon: "check-circle",
  to: `/${label}`,
});

const separator = (id: string): NavEntry => ({ type: "separator", id, label: () => id });
const divider: NavEntry = { type: "divider" };
const control = (id: string): NavEntry => ({ type: "control", id });
const slot = (id: string): NavEntry => ({ type: "slot", id });

function shape(entries: NavEntry[]): string[] {
  return entries.map(entry =>
    entry.type === "item" ? `item:${entry.to}` : `${entry.type}:${"id" in entry ? entry.id : ""}`,
  );
}

describe("compactNavEntries", () => {
  it("keeps a separator that is followed by a renderable entry", () => {
    expect(shape(compactNavEntries([separator("admin"), item("users")]))).toEqual(["separator:admin", "item:/users"]);
  });

  it("drops a separator whose section has no renderable entries", () => {
    expect(shape(compactNavEntries([separator("admin"), separator("reports"), item("users")]))).toEqual([
      "separator:reports",
      "item:/users",
    ]);
  });

  it("drops a trailing separator", () => {
    expect(shape(compactNavEntries([item("home"), separator("admin")]))).toEqual(["item:/home"]);
  });

  it("treats controls and slots as renderable when keeping a separator", () => {
    expect(shape(compactNavEntries([separator("tools"), control("theme")]))).toEqual([
      "separator:tools",
      "control:theme",
    ]);
    expect(shape(compactNavEntries([separator("tools"), slot("account")]))).toEqual([
      "separator:tools",
      "slot:account",
    ]);
  });

  it("stops looking for renderable entries at the next section break", () => {
    expect(shape(compactNavEntries([separator("admin"), divider, item("users")]))).toEqual(["item:/users"]);
  });

  it("keeps a divider between two renderable entries", () => {
    expect(shape(compactNavEntries([item("home"), divider, item("users")]))).toEqual([
      "item:/home",
      "divider:",
      "item:/users",
    ]);
  });

  it("drops leading and trailing dividers", () => {
    expect(shape(compactNavEntries([divider, item("home"), divider]))).toEqual(["item:/home"]);
  });

  it("drops a divider once the entries around it are gone", () => {
    expect(shape(compactNavEntries([item("home"), divider, separator("admin")]))).toEqual(["item:/home"]);
  });

  it("returns an empty list when nothing is renderable", () => {
    expect(compactNavEntries([separator("admin"), divider, separator("reports")])).toEqual([]);
  });

  it("leaves an already-compact list untouched", () => {
    const entries = [item("home"), divider, separator("admin"), item("users")];
    expect(shape(compactNavEntries(entries))).toEqual(shape(entries));
  });
});
