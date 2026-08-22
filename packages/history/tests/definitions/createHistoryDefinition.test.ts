import { createHistoryDefinition } from "@/index";
import { describe, expect, it } from "vitest";
import { z } from "zod";

describe(createHistoryDefinition, () => {
  it("rejects invalid configuration at definition creation time", () => {
    const schema = z.object({ name: z.string() });

    expect(() =>
      createHistoryDefinition(
        schema,
        { label: " ", key: () => "entity" },
        {
          name: { kind: "field", label: "Name" },
        },
      ),
    ).toThrow("History definition label must be a non-empty string.");
    expect(() =>
      createHistoryDefinition(
        schema,
        { label: "Entity", key: () => "entity" },
        {
          name: { kind: "unknown", label: "Name" } as never,
        },
      ),
    ).toThrow('History fields.name has unsupported kind "unknown".');
    expect(() =>
      createHistoryDefinition(
        z.object({ names: z.array(z.string()) }),
        { label: "Entity", key: () => "entity" },
        {
          names: {
            kind: "array",
            label: "Names",
            mode: "invalid" as never,
            item: { kind: "field", label: "Name" },
          },
        },
      ),
    ).toThrow('History fields.names mode must be "set" or "ordered".');
  });
});
