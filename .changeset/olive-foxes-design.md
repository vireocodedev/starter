---
"@vireocodedev/starter-ui": major
---

Replace the `exports` wildcard with three declared entry points.

`exports` previously mapped `"./*"` onto the build output, which made all 183 built modules public API. Any internal
rename was therefore a breaking change, and the honest semver bump for almost any change was major. The map now
declares exactly `.`, `./api` and `./country`; importing an undeclared internal path no longer resolves.

**This is the breaking part.** Every symbol reachable through the old wildcard is still reachable — the six that the
reference application used through deep paths (`endpoint`, `PageableParams`, `PageableResponse`, `zodParse`,
`CountryCode`, `getCountryName`) were all already exported from the root barrel. Consumers using deep paths must
repoint the import specifier; no symbol was removed or renamed.

The two extra entry points exist for reasons the root barrel cannot serve:

- **`./api`** is framework-free and safe to import from a Web Worker. The root barrel pulls in React, MUI and
  DOM-dependent providers, so a worker that imports it fails on load. This subpath re-exports the request and response
  helpers that the online and offline API modules share, and nothing else.
- **`./country`** gives the API layer a narrow import for country data instead of the whole component library. It is
  **not** worker-safe: `RGO_COUNTRY_CODES` and `CountryCode` derive from `country-flag-icons/react`, so importing it
  evaluates React components.

A new `entryPoints` test enforces both promises. It fails if a wildcard reappears, if an entry point points at a file
the build does not produce, or if anything in the `./api` runtime graph reaches for React, MUI or the DOM. Its
third-party surface is frozen to `axios` and `zod`, so a new runtime dependency has to be argued for rather than
acquired by accident through a convenience import.
