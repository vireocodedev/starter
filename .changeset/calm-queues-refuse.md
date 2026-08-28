---
"@vireocodedev/sqlite": patch
---

Reject duplicate queued command IDs and malformed replay responses, make equal-time
ordering deterministic, and serialize different concurrent offline-owner changes.
