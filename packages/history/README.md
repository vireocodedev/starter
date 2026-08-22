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

`zod >=3.24 <4` is the package's only peer dependency. Zod 4 support will be declared only after a dedicated compatibility pass.

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
- `set` arrays ignore order; `ordered` arrays additionally emit moved rows.
- Array item identities must be unique within each snapshot. Duplicate keys
  throw instead of silently overwriting an item.
- Unchanged rows are omitted unless `showUnchanged: true` is requested.
- Added, updated, removed, and unchanged nodes are emitted in deterministic
  change order.
- Both snapshots are parsed by the definition's Zod schema before comparison.

## Public concepts

- `createHistoryDefinition` creates a schema-derived entity definition.
- `createHistoryNodes` validates and compares two optional snapshots.
- `HistoryDefinition` and field config types describe definitions.
- `HistoryNode`, `HistoryGroupNode`, `HistoryFieldRow`, and `HistoryValue`
  describe emitted results.
- `createHistoryRecordSchema`, `HistoryRecordSchema`, and the record/snapshot
  types describe transport-neutral audit records.

The public surface is frozen by `api-surface.json`. Export changes require a
Changeset and deliberate semver decision.
