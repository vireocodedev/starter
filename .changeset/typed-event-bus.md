---
"@vireocodedev/starter-ui": minor
---

Add a typed application event bus.

`front-ui` bundled `tseep` and the starter dropped it, so two of the three
consumer apps rebuilt an event bus by hand — LMS through `front-ui`'s emitter,
FRED as `olEventService` for cross-panel geometry coordination. Neither had a
natural parent component to hang the coordination on, which is exactly the case
this covers.

Exports `RgoEventBus`, a shared `rgoEventBus` instance, and a
`useRgoEventListener` hook that subscribes for a component's lifetime. Event
names and payloads come from the augmentable `RgoEventRegistry` interface,
following the same declaration-merging pattern as `RgoDroppableIdRegistry`:

```ts
declare module "@vireocodedev/starter-ui" {
  interface RgoEventRegistry {
    "geometry:change": { featureId: string };
    "shift:ended": void;
  }
}
```

Implemented without a runtime dependency — the surface is four methods, and a
published package should not pull a transitive dependency to provide them. A
listener that throws is reported and skipped rather than cancelling delivery to
the rest.

Closes gaps G17, the bus half of F10, and the `tseep` part of G0 (roadmap 2.4,
work item W4).
