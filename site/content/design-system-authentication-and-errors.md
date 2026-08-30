# Authentication and errors

Authentication is shell infrastructure, not a business feature. This page records the Starter Template reference convention and the outcomes an application should preserve; it is not a blanket Vireo package UI guarantee. Applications own the authentication provider, authorization policy, data sensitivity, and product copy. Consult the [TypeScript API reference](/reference/typescript/) for public package APIs.

## Normalize before rendering

Translate transport and parsing failures into a small application error taxonomy before they reach a page or feature. At minimum, distinguish invalid credentials, unauthenticated visitors, forbidden access, expired sessions, connectivity failure, server failure, malformed response, and logout failure. Unknown failures use safe server-failure copy.

The backend remains authoritative for permissions. Route access metadata expresses required access rather than scattering role comparisons throughout the interface. Concurrent session-expiry responses converge on one centralized expiry transition. Keep transport-library error types and response-parser details out of feature UI; log endpoint and operation context for developers while presenting localized, safe feedback to users.

## Render the affected boundary

Queries define loading, empty, error, and success states without duplicate retry notifications. A background refresh error retains usable stale content and offers contextual recovery. Mutations provide feedback appropriate to the operation and retain enough context to understand the affected record. A root error boundary handles unexpected render failures; routing supplies explicit forbidden and not-found views.

Authentication bootstrap or session recovery may use a branded application loader. A login failure identifies invalid credentials without exposing sensitive detail. An expired session explains what happened and offers a safe path back to authentication. If logout fails, retain authenticated state and announce globally that sign-out did not complete—do not pretend the session has ended.

Keep focus deliberate when a recovery surface appears, preserve the application shell where it remains usable, and use a single useful status rather than multiple competing alerts. The [loading-state standard](/docs/design-system/loading-states/) and [accessibility guide](/docs/accessibility/) define the underlying busy, announcement, and focus requirements.
