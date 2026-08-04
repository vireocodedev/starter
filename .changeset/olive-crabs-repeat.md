---
"@vireocodedev/starter-history": patch
"@vireocodedev/starter-queryengine": patch
---

Widen the `zod` peer range floor to `>=3.24` to match `@vireocodedev/starter-ui`.

Both packages previously advertised `>=3`, so a consumer could install a zod version
that satisfied them but not `starter-ui`, which `starter-ui` depends on `starter-history`
for. The ranges now agree on a single floor.
