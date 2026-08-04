---
"@vireocodedev/starter-sqlite": major
---

`@sqlite.org/sqlite-wasm` is now a peer dependency instead of a direct dependency.

The WASM runtime keeps state in OPFS and must be configured by the host app (Vite
`optimizeDeps.exclude`, plus the COOP/COEP headers the OPFS VFS requires). Shipping
it as a direct dependency allowed a second, differently-versioned copy to be
installed alongside the app's own, which would open two independent handles to the
same database file.

Consumers must declare `@sqlite.org/sqlite-wasm` themselves. npm installs missing
peers automatically; pnpm and `--strict-peer-deps` users will need to add it
explicitly.
