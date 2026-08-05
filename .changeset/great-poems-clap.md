---
"@vireocodedev/starter-ui": patch
---

`handleBadRequestError` no longer throws when a 400 arrives without a response body.

The guard read `error?.response.data`, so the optional chain stopped one level short:
any 400-status error lacking a `response` (a synthesized error, an aborted request)
raised a `TypeError` from inside the error handler instead of being ignored.
