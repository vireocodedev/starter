import { createHistoryRecordSchema, HistoryActorSchema, HistoryRecordSchema, HistorySnapshotSchema } from "@/index";
import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";

const record = {
  id: "history-1",
  timestamp: "2026-08-22T12:00:00Z",
  actor: { id: "user-1", label: "Alice" },
  entity: "INVOICE",
  entityId: "invoice-42",
  snapshotPrevious: null,
  snapshotCurrent: { total: 100 },
};

describe("history record schemas", () => {
  it("parses generic records and system actors", () => {
    expect(HistoryRecordSchema.parse(record)).toEqual(record);
    expect(HistoryRecordSchema.parse({ ...record, actor: null }).actor).toBeNull();
    expect(HistorySnapshotSchema.parse({ nested: { value: true } })).toEqual({ nested: { value: true } });
  });

  it("narrows application-owned entity kinds", () => {
    const schema = createHistoryRecordSchema({ entityKind: z.enum(["INVOICE", "BUYER"]) });
    const parsed = schema.parse(record);

    expectTypeOf(parsed.entity).toEqualTypeOf<"INVOICE" | "BUYER">();
    expect(() => schema.parse({ ...record, entity: "UNKNOWN" })).toThrow();
  });

  it("rejects invalid actor and timestamp metadata", () => {
    expect(() => HistoryActorSchema.parse({ label: "" })).toThrow();
    expect(() => HistoryActorSchema.parse({ label: "   " })).toThrow("History actor label cannot be blank.");
    expect(() => HistoryRecordSchema.parse({ ...record, timestamp: "" })).toThrow();
    expect(() => HistoryRecordSchema.parse({ ...record, timestamp: "yesterday" })).toThrow();
    expect(() => HistoryRecordSchema.parse({ ...record, timestamp: Number.POSITIVE_INFINITY })).toThrow();
  });

  it("supports application-owned snapshot and timestamp schemas", () => {
    const schema = createHistoryRecordSchema({
      entityKind: z.literal("INVOICE"),
      snapshot: z.object({ total: z.number() }),
      timestamp: z.string().regex(/^revision-/u),
    });
    const parsed = schema.parse({ ...record, timestamp: "revision-7" });

    expectTypeOf(parsed.entity).toEqualTypeOf<"INVOICE">();
    expectTypeOf(parsed.timestamp).toEqualTypeOf<string>();
    expectTypeOf(parsed.snapshotCurrent).toEqualTypeOf<{ total: number } | null>();
    expect(parsed.snapshotCurrent?.total).toBe(100);
  });
});
