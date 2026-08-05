---
"@vireocodedev/starter-ui": minor
---

`useRgoSseEmitter`: dispatch to current handlers, and reconnect automatically.

Two fixes and one addition.

**Handlers are no longer frozen at mount.** `eventHandlers`, `onOpen`,
`onMessage` and `onError` were captured on the first render behind four
`react-hooks/exhaustive-deps` suppressions, so a handler that closed over state
kept firing against the values it saw at mount. They are now read at dispatch
time, and all four suppressions are gone. Replacing the `eventHandlers` object no
longer tears down the connection either, so consumers no longer need to memoise
it.

**The stream now recovers on its own.** `EventSource` retries while a connection
is merely dropped, but once it reports `CLOSED` the browser has given up and the
stream stayed dead until something called `reconnect()` by hand. The hook now
reconnects with exponential backoff, configurable through `reconnectBaseDelayMs`,
`reconnectMaxDelayMs` and `maxRetries`, with `onReconnectAttempt` and
`onReconnectFailed` callbacks. The manual `reconnect()` still works and resets
the retry budget.

**Added:** a `status` field on the return value (`"connecting" | "open" |
"reconnecting" | "closed"`) so a consumer can show a reconnecting indicator, and
malformed event payloads now go to `onError` instead of throwing inside a
listener where the browser swallows them.

Additive — existing call sites keep working unchanged.

Closes gaps G15 and the reconnect half of G14 from the LMS paper prototype
(roadmap 2.4, work item W3). Missed-event replay is deliberately out of scope: it
needs a `Last-Event-ID` contract the starter cannot decide on a consumer's
behalf.
