---
"@vireocodedev/starter-history": major
"@vireocodedev/starter-ui": patch
---

Replace the React-oriented history rendering contract with a framework-free
definition and diff API. History formatters now return strings, emitted values
preserve `{ raw, formatted }`, records use neutral actor metadata, duplicate
array identities fail explicitly, and the package is guaranteed worker-safe.

Update `VireoHistoryEntry` to consume the new framework-neutral history nodes.
