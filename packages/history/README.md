# @vireocodedev/starter-history

Framework-free entity-history primitives: typed definitions, validated history
records, and a deterministic diff engine. The package owns no React components,
renderers, HTTP client, application entity enum, or persistence policy.

React presentation belongs to `@vireocodedev/starter-ui`, whose
`VireoHistoryEntry` component consumes the nodes produced here.

## Install

```bash
npm install @vireocodedev/starter-history zod
```

`zod >=4.4 <5` is the package's only peer dependency.

## Define and compare an entity

```ts
import { createHistoryDefinition, createHistoryNodes } from "@vireocodedev/starter-history";
import { z } from "zod";

const CountrySchema = z.object({
  code: z.string(),
  name: z.string(),
  tax: z.number(),
});

const countryHistory = createHistoryDefinition(
  CountrySchema,
  {
    label: "Country",
    key: country => country.code,
    format: country => country.name,
  },
  {
    code: false,
    name: { kind: "field", label: "Name" },
    tax: {
      kind: "field",
      label: "Tax",
      format: tax => `${tax}%`,
    },
  },
);

const nodes = createHistoryNodes(
  countryHistory,
  { code: "HR", name: "Croatia", tax: 25 },
  { code: "HR", name: "Croatia", tax: 24 },
);
```

Definitions are inferred from their Zod schema. Every schema property must be
configured or explicitly ignored with `false`, so a newly added model field
cannot silently disappear from history.

`format` is optional and must return a string. Each emitted value preserves both
representations:

```ts
{
  raw: 25,
  formatted: "25%"
}
```

That boundary keeps the engine useful in Node and Workers while allowing UI to
render the formatted text or make a UI-specific decision from `raw`.

## Records

```ts
import { createHistoryRecordSchema } from "@vireocodedev/starter-history";
import { z } from "zod";

const HistoryRecordSchema = createHistoryRecordSchema({
  entityKind: z.enum(["INVOICE", "BUYER"]),
  snapshot: z.object({ total: z.number() }),
});

const record = HistoryRecordSchema.parse(await response.json());
```

A record uses neutral actor metadata:

```ts
{
  id: "history-1",
  timestamp: "2026-08-22T12:00:00Z",
  actor: { id: "user-1", label: "Alice" },
  entity: "INVOICE",
  entityId: "invoice-42",
  snapshotPrevious: null,
  snapshotCurrent: { total: 100 }
}
```

Use `actor: null` for system-generated changes. Entity kinds remain
application-owned; passing a Zod enum narrows and validates them.

## Diff semantics

- `null` and `undefined` mean a value is absent.
- An empty string is a present value and participates in ordinary updates.
- Added or removed empty arrays and objects remain visible as container changes.
- `set` arrays ignore order; `ordered` arrays additionally emit deliberate moved
  rows. Insertions and removals do not mark every shifted neighbor as moved.
- Array item identities must be unique within each snapshot. Duplicate keys
  throw instead of silently overwriting an item.
- Identities are strings or finite numbers. Node paths preserve that segment
  type; encode paths canonically rather than joining them with a delimiter.
- Unchanged rows are omitted unless `showUnchanged: true` is requested.
- Added, updated, removed, and unchanged nodes are emitted in deterministic
  change order.
- Both snapshots are parsed once by the root definition's Zod schema before
  comparison. Parent schemas must compose the schemas owned by nested
  definitions; nested schemas are not parsed a second time.

## Value comparison and formatting

Default comparison supports primitives, Dates, arrays, and plain objects. It
uses a typed canonical representation with deterministic object-key ordering.
Cycles, functions, symbols, Maps, Sets, and other unsupported object types throw
instead of being silently treated as equal.

Use a field's `resolveChange` when domain equality differs from structural
equality. Return `null` to treat the field as unchanged, or `"added"`,
`"updated"`, or `"removed"` to select an explicit change.

Definitions are runtime-validated when created. Labels must be nonempty, modes
must be supported, callbacks must be functions, and nested configurations must
be structurally valid.

## Nested definitions and collections

An object field references a reusable definition:

```ts
const CustomerSchema = z.object({ address: AddressSchema });

const customerHistory = createHistoryDefinition(
  CustomerSchema,
  { label: "Customer", key: () => "customer" },
  { address: { kind: "object", definition: addressHistory } },
);
```

Array object items use the nested definition's `key`. Primitive array items
identify themselves. Use `mode: "ordered"` only when order is part of the
audited meaning.

## Public concepts

- `createHistoryDefinition` creates a schema-derived entity definition.
- `createHistoryNodes` validates and compares two optional snapshots.
- `HistoryDefinition` and field config types describe definitions.
- `HistoryNode`, `HistoryGroupNode`, `HistoryFieldRow`, and `HistoryValue`
  describe emitted results.
- `HistoryPath` and `HistoryPathSegment` describe lossless node locations.
- `createHistoryRecordSchema`, `HistoryRecordSchema`, and the record/snapshot
  types describe transport-neutral audit records. The factory accepts optional
  `entityKind`, `snapshot`, and `timestamp` Zod schemas.

The public surface is frozen by `api-surface.json`. Export changes require a
Changeset and deliberate semver decision.
