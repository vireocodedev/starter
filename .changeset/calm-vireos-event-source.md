---
"@vireocodedev/starter-ui": major
---

Replace the package-root `useRgoSseEmitter` API with `useVireoEventSource` from the dedicated `@vireocodedev/starter-ui/event-source` entry point. The new integration preserves native EventSource reconnection, exposes reactive lifecycle state and explicit reconnecting, updates named listeners without reconnecting, delivers raw events for application-owned decoding, and isolates listener failures from transport failures.
