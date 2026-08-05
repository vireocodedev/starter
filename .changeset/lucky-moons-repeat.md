---
"@vireocodedev/starter-queryengine": patch
---

Stop the emitted declarations from referencing `dataTagSymbol`.

`createQueryEngineQueries` left its return type to inference. TypeScript expanded
the `DataTag` brand `queryOptions` puts on `queryKey` into a structural type keyed
by two `unique symbol`s that `@tanstack/query-core` declares privately, then wrote
them into `queryengine.query.d.ts` as bare identifiers nothing brings into scope.

The factories now carry an explicit return type, so the emitter prints a named
alias instead of expanding it. The brand is preserved, so `getQueryData` still
infers its result.

Behaviour is unchanged; this only affects consumers compiling with
`skipLibCheck: false`, for whom the package previously did not compile at all.
