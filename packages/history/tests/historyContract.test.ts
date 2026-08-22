import { createHistoryDefinition, createHistoryNodes, createHistoryRecordSchema } from "@/index";
import { describe, expect, it } from "vitest";
import { z } from "zod";

const baseRecord = {
  id: "h1",
  timestamp: 1710000000000,
  actor: { id: "user-1", label: "Alice" },
  entity: "INVOICE",
  entityId: "42",
  snapshotPrevious: null,
  snapshotCurrent: { total: 100 },
};

describe("history public workflow", () => {
  it("parses a history record with an optional entity-kind constraint", () => {
    expect(createHistoryRecordSchema().parse(baseRecord).entity).toBe("INVOICE");
    const schema = createHistoryRecordSchema(z.enum(["INVOICE", "BUYER"]));
    expect(schema.parse(baseRecord).actor?.label).toBe("Alice");
    expect(() => schema.parse({ ...baseRecord, entity: "UNKNOWN" })).toThrow();
  });

  it("creates a typed definition and emits framework-neutral values", () => {
    const schema = z.object({ tax: z.number() });
    const definition = createHistoryDefinition(
      schema,
      { label: "Country", key: entity => String(entity.tax), format: entity => String(entity.tax) },
      { tax: { kind: "field", label: "Tax", format: tax => `${tax}%` } },
    );

    const [group] = createHistoryNodes(definition, { tax: 1 }, { tax: 2 });
    expect(group).toMatchObject({
      type: "group",
      value: { raw: { tax: 2 }, formatted: "2" },
      children: [
        {
          type: "updated",
          previous: { raw: 1, formatted: "1%" },
          current: { raw: 2, formatted: "2%" },
        },
      ],
    });
  });
});
