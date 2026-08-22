import { createHistoryDefinition, createHistoryNodes } from "@/index";
import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("history audit regressions", () => {
  it("distinguishes different Date values", () => {
    const schema = z.object({ id: z.string(), occurredAt: z.date() });
    const definition = createHistoryDefinition(
      schema,
      { label: "Event", key: event => event.id },
      { id: false, occurredAt: { kind: "field", label: "Occurred at" } },
    );

    const nodes = createHistoryNodes(
      definition,
      { id: "event-1", occurredAt: new Date("2026-01-01T00:00:00Z") },
      { id: "event-1", occurredAt: new Date("2027-01-01T00:00:00Z") },
    );

    expect(nodes).toHaveLength(1);
  });

  it("distinguishes objects containing different bigint values", () => {
    const schema = z.object({ id: z.string(), payload: z.unknown() });
    const definition = createHistoryDefinition(
      schema,
      { label: "Event", key: event => event.id },
      { id: false, payload: { kind: "field", label: "Payload" } },
    );

    expect(
      createHistoryNodes(
        definition,
        { id: "event-1", payload: { revision: 1n } },
        { id: "event-1", payload: { revision: 2n } },
      ),
    ).toHaveLength(1);
  });

  it("rejects cyclic values instead of silently treating them as equal", () => {
    const schema = z.object({ id: z.string(), payload: z.unknown() });
    const definition = createHistoryDefinition(
      schema,
      { label: "Event", key: event => event.id },
      { id: false, payload: { kind: "field", label: "Payload" } },
    );
    const previous: Record<string, unknown> = { revision: 1 };
    previous.self = previous;
    const current: Record<string, unknown> = { revision: 2 };
    current.self = current;

    expect(() =>
      createHistoryNodes(definition, { id: "event-1", payload: previous }, { id: "event-1", payload: current }),
    ).toThrow(/cyclic/u);
  });

  it("compares plain objects deterministically and rejects unsupported object types", () => {
    const schema = z.object({ id: z.string(), payload: z.unknown() });
    const definition = createHistoryDefinition(
      schema,
      { label: "Event", key: event => event.id },
      { id: false, payload: { kind: "field", label: "Payload" } },
    );

    expect(
      createHistoryNodes(
        definition,
        { id: "event-1", payload: { first: 1, second: 2 } },
        { id: "event-1", payload: { second: 2, first: 1 } },
      ),
    ).toEqual([]);
    expect(() =>
      createHistoryNodes(
        definition,
        { id: "event-1", payload: new Map([["revision", 1]]) },
        { id: "event-1", payload: new Map([["revision", 2]]) },
      ),
    ).toThrow('History values do not support object type "Map".');
  });

  it("preserves numeric and string array identities as distinct paths", () => {
    const itemSchema = z.object({ id: z.union([z.string(), z.number()]), name: z.string() });
    const itemDefinition = createHistoryDefinition(
      itemSchema,
      { label: "Item", key: item => item.id },
      { id: false, name: { kind: "field", label: "Name" } },
    );
    const schema = z.object({ items: z.array(itemSchema) });
    const definition = createHistoryDefinition(
      schema,
      { label: "List", key: () => "list" },
      { items: { kind: "array", label: "Items", item: { kind: "object", definition: itemDefinition } } },
    );

    const [root] = createHistoryNodes(
      definition,
      { items: [] },
      {
        items: [
          { id: 1, name: "Numeric" },
          { id: "1", name: "String" },
        ],
      },
    );
    if (root?.type !== "group" || root.children[0]?.type !== "group") throw new Error("Expected items group.");

    expect(root.children[0].children.map(node => node.path)).toEqual([
      ["items", 1],
      ["items", "1"],
    ]);
  });

  it("emits added and removed empty containers", () => {
    const schema = z.object({ items: z.array(z.string()).nullable() });
    const definition = createHistoryDefinition(
      schema,
      { label: "List", key: () => "list" },
      { items: { kind: "array", label: "Items", item: { kind: "field", label: "Item" } } },
    );

    expect(createHistoryNodes(definition, { items: null }, { items: [] })).toMatchObject([
      {
        type: "group",
        children: [{ type: "group", path: ["items"], changeType: "added", children: [] }],
      },
    ]);
    expect(createHistoryNodes(definition, { items: [] }, { items: null })).toMatchObject([
      {
        type: "group",
        children: [{ type: "group", path: ["items"], changeType: "removed", children: [] }],
      },
    ]);

    const metadataSchema = z.object({ metadata: z.object({}).nullable() });
    const emptyMetadataDefinition = createHistoryDefinition(
      z.object({}),
      { label: "Metadata", key: () => "metadata" },
      {},
    );
    const metadataHistory = createHistoryDefinition(
      metadataSchema,
      { label: "Document", key: () => "document" },
      { metadata: { kind: "object", definition: emptyMetadataDefinition } },
    );

    expect(createHistoryNodes(metadataHistory, { metadata: null }, { metadata: {} })).toMatchObject([
      {
        type: "group",
        children: [{ type: "group", path: ["metadata"], changeType: "added", children: [] }],
      },
    ]);
  });

  it.fails("does not report insertion shifts as deliberate moves", () => {
    const itemSchema = z.object({ id: z.string() });
    const itemDefinition = createHistoryDefinition(itemSchema, { label: "Item", key: item => item.id }, { id: false });
    const schema = z.object({ items: z.array(itemSchema) });
    const definition = createHistoryDefinition(
      schema,
      { label: "List", key: () => "list" },
      {
        items: {
          kind: "array",
          label: "Items",
          mode: "ordered",
          item: { kind: "object", definition: itemDefinition },
        },
      },
    );

    const [root] = createHistoryNodes(
      definition,
      { items: [{ id: "a" }, { id: "b" }] },
      { items: [{ id: "x" }, { id: "a" }, { id: "b" }] },
    );
    if (root?.type !== "group" || root.children[0]?.type !== "group") throw new Error("Expected items group.");

    expect(root.children[0].children).toHaveLength(1);
    expect(root.children[0].children[0]).toMatchObject({ type: "added", path: ["items", "x"] });
  });
});
