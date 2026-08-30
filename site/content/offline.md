# Offline behavior

Vireo provides an offline-capable application shell, explicit local-storage primitives and UX conventions. It does **not** claim that arbitrary domain mutations become safe offline automatically.

## Guaranteed shell behavior

- The production PWA can install a service worker.
- Reviewed static assets are precached.
- Navigation can recover through the application shell where configured.
- Update availability is surfaced deliberately.
- Loading, unavailable and retry states remain visible.

Generated applications derive their manifest and HTML identity from the rendered
`pwa-policy.mjs` rather than a `VITE_APP_NAME` environment override. Source and
built contract checks, including an automated two-production-build activation and
reload lifecycle, exercise this bounded shell behavior. Installed-PWA support is
experimental. Branded-browser and physical-device evidence is not run.

## Domain operations require policy

Before queueing an operation, the application must decide:

- Whether stale data is safe to display.
- Whether the operation is idempotent.
- How conflicts are detected and resolved.
- Whether credentials and sensitive payloads may be persisted.
- What expiry and retry limits apply.
- How the user learns that local state is not yet authoritative.

## Treat connectivity as a signal

Browser online status is not proof that the backend is reachable. Design requests to fail explicitly, preserve actionable error information and allow deliberate retry.

## Recommended adoption

1. Start with offline shell and read-only resilience.
2. Identify one low-risk domain operation.
3. Document its idempotency, conflict and retention policy.
4. Test network loss during every state transition.
5. Add observability before expanding the queue.

The [live demo](https://demo.vireocode.com) demonstrates the current bounded behavior; it is not a blanket offline synchronization guarantee.
