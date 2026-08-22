import { createHistoryDefinition, createHistoryNodes } from "@/index";
import { describe, expect, it } from "vitest";
import { z } from "zod";

describe(createHistoryNodes, () => {
  it("distinguishes absent values from empty strings and orders change rows deterministically", () => {
    const schema = z.object({
      added: z.string().nullable(),
      changed: z.string(),
      removed: z.string().nullable(),
      unchanged: z.string(),
    });
    const definition = createHistoryDefinition(
      schema,
      { label: "Profile", key: value => value.unchanged },
      {
        removed: { kind: "field", label: "Removed" },
        unchanged: { kind: "field", label: "Unchanged" },
        changed: { kind: "field", label: "Changed" },
        added: { kind: "field", label: "Added" },
      },
    );

    const [group] = createHistoryNodes(
      definition,
      { added: null, changed: "", removed: "old", unchanged: "same" },
      { added: "new", changed: "value", removed: null, unchanged: "same" },
      { showUnchanged: true },
    );

    expect(group?.type).toBe("group");
    if (group?.type !== "group") throw new Error("Expected a root history group.");
    expect(group.children.map(node => [node.type, node.label])).toEqual([
      ["added", "Added"],
      ["updated", "Changed"],
      ["removed", "Removed"],
      ["unchanged", "Unchanged"],
    ]);
    expect(group.children[1]).toMatchObject({
      previous: { raw: "", formatted: "" },
      current: { raw: "value", formatted: "value" },
    });
  });

  it("passes typed parent, side, and path context to string formatters", () => {
    const contexts: unknown[] = [];
    const schema = z.object({ id: z.string(), amount: z.number() });
    const definition = createHistoryDefinition(
      schema,
      {
        label: "Invoice",
        key: value => value.id,
        format: (value, context) => {
          contexts.push(context);
          return value.id;
        },
      },
      {
        id: false,
        amount: {
          kind: "field",
          label: "Amount",
          format: (value, context) => {
            contexts.push(context);
            return `EUR ${value}`;
          },
        },
      },
    );

    createHistoryNodes(definition, { id: "i-1", amount: 10 }, { id: "i-1", amount: 20 });

    expect(contexts).toEqual([
      { parent: { id: "i-1", amount: 10 }, side: "previous", path: ["amount"] },
      { parent: { id: "i-1", amount: 20 }, side: "current", path: ["amount"] },
      { parent: { id: "i-1", amount: 20 }, side: "current", path: [] },
    ]);
  });

  it("honors and validates custom change resolution", () => {
    const schema = z.object({ value: z.string() });
    const unchangedDefinition = createHistoryDefinition(
      schema,
      { label: "Value", key: () => "value" },
      { value: { kind: "field", label: "Value", resolveChange: () => null } },
    );
    const invalidResolver = (() => "invalid") as never;
    const invalidDefinition = createHistoryDefinition(
      schema,
      { label: "Value", key: () => "value" },
      { value: { kind: "field", label: "Value", resolveChange: invalidResolver } },
    );

    expect(createHistoryNodes(unchangedDefinition, { value: "before" }, { value: "after" })).toEqual([]);
    expect(() => createHistoryNodes(invalidDefinition, { value: "before" }, { value: "after" })).toThrow(
      'History change resolver at "value" returned unsupported type "invalid".',
    );
  });

  it("emits nested object groups with raw and formatted identities", () => {
    const addressSchema = z.object({ city: z.string(), country: z.string() });
    const addressDefinition = createHistoryDefinition(
      addressSchema,
      { label: "Address", key: value => value.country, format: value => value.city },
      {
        city: { kind: "field", label: "City" },
        country: { kind: "field", label: "Country" },
      },
    );
    const profileSchema = z.object({ id: z.string(), address: addressSchema });
    const profileDefinition = createHistoryDefinition(
      profileSchema,
      { label: "Profile", key: value => value.id },
      { id: false, address: { kind: "object", definition: addressDefinition } },
    );

    const [root] = createHistoryNodes(
      profileDefinition,
      { id: "p-1", address: { city: "Zagreb", country: "HR" } },
      { id: "p-1", address: { city: "Samobor", country: "HR" } },
    );

    expect(root).toMatchObject({
      type: "group",
      children: [
        {
          type: "group",
          path: ["address"],
          value: { raw: { city: "Samobor", country: "HR" }, formatted: "Samobor" },
          changeType: "updated",
          children: [{ type: "updated", path: ["address", "city"] }],
        },
      ],
    });
  });

  it("diffs set arrays by object identity without treating order as a change", () => {
    const itemSchema = z.object({ id: z.string(), name: z.string() });
    const itemDefinition = createHistoryDefinition(
      itemSchema,
      { label: "Member", key: value => value.id, format: value => value.name },
      { id: false, name: { kind: "field", label: "Name" } },
    );
    const teamSchema = z.object({ id: z.string(), members: z.array(itemSchema) });
    const teamDefinition = createHistoryDefinition(
      teamSchema,
      { label: "Team", key: value => value.id },
      {
        id: false,
        members: {
          kind: "array",
          label: "Members",
          item: { kind: "object", definition: itemDefinition },
        },
      },
    );

    const [root] = createHistoryNodes(
      teamDefinition,
      {
        id: "team-1",
        members: [
          { id: "1", name: "Old" },
          { id: "2", name: "Removed" },
        ],
      },
      {
        id: "team-1",
        members: [
          { id: "3", name: "Added" },
          { id: "1", name: "New" },
        ],
      },
    );

    if (root?.type !== "group" || root.children[0]?.type !== "group") {
      throw new Error("Expected a members group.");
    }
    expect(root.children[0].children.map(node => [node.type, node.path.at(-1)])).toEqual([
      ["group", "3"],
      ["group", "1"],
      ["group", "2"],
    ]);
    expect(root.children[0].children.map(node => (node.type === "group" ? node.changeType : node.type))).toEqual([
      "added",
      "updated",
      "removed",
    ]);
  });

  it("emits one-based movement values for ordered arrays", () => {
    const itemSchema = z.object({ id: z.string(), name: z.string() });
    const itemDefinition = createHistoryDefinition(
      itemSchema,
      { label: "Item", key: value => value.id, format: value => value.name },
      { id: false, name: { kind: "field", label: "Name" } },
    );
    const listSchema = z.object({ items: z.array(itemSchema) });
    const listDefinition = createHistoryDefinition(
      listSchema,
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
      listDefinition,
      {
        items: [
          { id: "a", name: "A" },
          { id: "b", name: "B" },
        ],
      },
      {
        items: [
          { id: "b", name: "B" },
          { id: "a", name: "A" },
        ],
      },
    );

    if (root?.type !== "group" || root.children[0]?.type !== "group") {
      throw new Error("Expected an ordered items group.");
    }
    const movedRows = root.children[0].children.flatMap(node => (node.type === "group" ? node.children : []));
    expect(movedRows).toEqual([
      {
        type: "moved",
        path: ["items", "b", "$position"],
        label: "Position",
        previous: { raw: 1, formatted: "2" },
        current: { raw: 0, formatted: "1" },
      },
    ]);
  });

  it("uses the configured position label for deliberate moves", () => {
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
      { items: [{ id: "b" }, { id: "a" }] },
      { positionLabel: "Order" },
    );
    if (root?.type !== "group" || root.children[0]?.type !== "group") throw new Error("Expected items group.");

    expect(root.children[0].children[0]).toMatchObject({
      type: "group",
      children: [{ type: "moved", label: "Order" }],
    });
  });

  it("rejects duplicate identities instead of silently overwriting array items", () => {
    const itemSchema = z.object({ id: z.string(), name: z.string() });
    const itemDefinition = createHistoryDefinition(
      itemSchema,
      { label: "Item", key: value => value.id },
      { id: false, name: { kind: "field", label: "Name" } },
    );
    const listSchema = z.object({ items: z.array(itemSchema) });
    const listDefinition = createHistoryDefinition(
      listSchema,
      { label: "List", key: () => "list" },
      { items: { kind: "array", label: "Items", item: { kind: "object", definition: itemDefinition } } },
    );

    expect(() =>
      createHistoryNodes(
        listDefinition,
        { items: [] },
        {
          items: [
            { id: "a", name: "A" },
            { id: "a", name: "B" },
          ],
        },
      ),
    ).toThrow('Duplicate history array identity "a" in the current snapshot at "items".');
  });

  it("rejects non-finite object identities", () => {
    const itemSchema = z.object({ name: z.string() });
    const itemDefinition = createHistoryDefinition(
      itemSchema,
      { label: "Item", key: () => Number.POSITIVE_INFINITY },
      { name: { kind: "field", label: "Name" } },
    );
    const schema = z.object({ items: z.array(itemSchema) });
    const definition = createHistoryDefinition(
      schema,
      { label: "List", key: () => "list" },
      { items: { kind: "array", label: "Items", item: { kind: "object", definition: itemDefinition } } },
    );

    expect(() => createHistoryNodes(definition, { items: [] }, { items: [{ name: "Invalid" }] })).toThrow(
      'History array identity in the current snapshot at "items" must be a string or finite number.',
    );
  });

  it("rejects invalid snapshots and non-string formatter results", () => {
    const schema = z.object({ id: z.string(), count: z.number() });
    const invalidFormat = (() => 4) as unknown as (value: number) => string;
    const definition = createHistoryDefinition(
      schema,
      { label: "Counter", key: value => value.id },
      { id: false, count: { kind: "field", label: "Count", format: invalidFormat } },
    );

    expect(() => createHistoryNodes(definition, { id: "a", count: 1 }, { id: "a", count: "2" } as never)).toThrow();
    expect(() => createHistoryNodes(definition, { id: "a", count: 1 }, { id: "a", count: 2 })).toThrow(
      'History formatter at "count" must return a string.',
    );
  });
});
