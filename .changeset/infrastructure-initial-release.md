---
"@vireocodedev/starter-infrastructure": minor
---

Initial release of the framework-agnostic frontend infrastructure utilities:
network status (`useAppOnlineStatus`, `AppOfflineError`), persistent signals
(`createPersistentSignal`), the offline-aware TanStack query client, session-
expiry DOM events, axios helpers (`isRequestCanceled`, `sanitizeAxiosError`),
and date/array helpers. No `@rgo/front-ui` or private-registry coupling.
