# @vireocodedev/starter-history

Framework-agnostic **entity history** primitives for the vireocodedev **starter**
product: a headless diff/build **engine** and **generic history models**. No UI,
no HTTP, no app coupling — peers are only `zod` and `react` (types only).

> The MUI history views, the axios-backed API, and the app's concrete entity
> kinds intentionally stay in the host application (same split as the query
> engine). This package is the reusable core they build on.

## Install

```bash
npm install @vireocodedev/starter-history
```

Peers: `react` (type-only), `zod`.

## Models (generic over entity kind)

Entity kinds are opaque strings; the app injects its concrete set:

```ts
import { createHistorySchemas } from "@vireocodedev/starter-history";
import z from "zod";

const AppEntityKind = z.enum(["INVOICE", "BUYER", "COMPANY", "COUNTRY", "PRODUCT"]);
const { history } = createHistorySchemas(AppEntityKind); // validated History zod schema

const records = z.array(history).parse(await fetchHistory());
```

- `History<TSnapshot>` — a history record, generic over the snapshot shape.
- `HistorySnapshot` / `HistorySnapshotSchema` — an opaque field bag.
- `HistoryEntityKind` — opaque `string` at the library level.
- `createHistorySchemas(entityKindSchema?)` — builds the `History` parse schema.

## Engine (headless diff/build)

Describe how an entity's fields render, then diff two snapshots into a node tree:

```ts
import { createHistoryDefinitionBuilderFn, createHistoryNodes } from "@vireocodedev/starter-history";

const build = createHistoryDefinitionBuilderFn(CountrySchema);
const definition = build(
  { label: "Country", key: c => c.code, render: c => c.name },
  { code: false, tax: { kind: "field", label: "Tax", render: v => `${v}%` } },
);

const nodes = createHistoryNodes(definition, previousSnapshot, currentSnapshot);
```

- `createHistoryDefinitionBuilderFn(schema)` — a typed definition builder for a zod schema.
- `createHistoryNodes` / `createHistoryGroup` — diff snapshots into `HistoryNode[]`.
- `HistoryEngineOptions`, `HistoryNode`, `HistoryGroupNode`, `HistoryDefinition`, … — engine types.

`render` outputs are `React.ReactNode` (type-only dependency), so the host app
supplies the actual rendering layer.

## Versioning contract

The engine + model surface is a contract (add = minor, remove/rename = major),
guarded by the contract test.
