import { describe, expect, it } from "vitest";
import z from "zod";
import { createHistoryDefinitionBuilderFn, createHistoryNodes, createHistorySchemas } from "@/index";

const baseRecord = {
  id: "h1",
  timestamp: 1710000000000,
  ownerUsername: "alice",
  entity: "INVOICE",
  entityId: "42",
  snapshotPrevious: null,
  snapshotCurrent: { total: 100 },
};

describe("history contract", () => {
  it("parses a history record with the default (string) entity kind", () => {
    const { history } = createHistorySchemas();
    const parsed = history.parse(baseRecord);
    expect(parsed.entity).toBe("INVOICE");
    expect(parsed.snapshotCurrent).toEqual({ total: 100 });
  });

  it("validates the entity kind against an injected schema", () => {
    const { history } = createHistorySchemas(z.enum(["INVOICE", "BUYER"]));
    expect(() => history.parse(baseRecord)).not.toThrow();
    expect(() => history.parse({ ...baseRecord, entity: "UNKNOWN" })).toThrow();
  });

  it("rejects records missing required fields", () => {
    const { history } = createHistorySchemas();
    expect(() => history.parse({ id: "x" })).toThrow();
  });

  it("builds a definition and diffs snapshots into change nodes", () => {
    const build = createHistoryDefinitionBuilderFn(z.object({ tax: z.number() }));
    const definition = build(
      { label: "Country", key: entity => String(entity.tax), render: entity => String(entity.tax) },
      { tax: { kind: "field", label: "Tax", render: tax => `${tax}%` } },
    );

    expect(definition.options.label).toBe("Country");
    expect(createHistoryNodes(definition, { tax: 1 }, { tax: 2 }).length).toBeGreaterThan(0);
    expect(createHistoryNodes(definition, { tax: 1 }, { tax: 1 })).toEqual([]);
  });
});
