# @vireocodedev/starter-infrastructure

## 2.0.0

### Major Changes

- 72aac63: Rebuild Infrastructure as a React-free browser-services package with validated Axios transport, strict pagination, execution-mode-aware APIs, instance-scoped connectivity and session-expiry coordination, persistent state, explicit failure policy, lightweight worker-safe subpaths, and executable documentation.

  Remove package-global application state, React Query ownership, React hooks and components, service-worker policy, and application-specific helpers; React adapters now live in Starter UI.

## 1.1.0

### Minor Changes

- 7a07935: Add mode-aware APIs, typed HTTP and paged queries, connectivity state, query reconnects, and service-worker update checks.

## 1.0.0

### Major Changes

- dc5b42d: Milestone - collective major bump

## 0.4.0

### Minor Changes

- ada88d7: Remove tseep dependency, add turbo for build

## 0.2.0

### Minor Changes

- 39c9f8b: Initial release of the framework-agnostic frontend infrastructure utilities:
  network status (`useAppOnlineStatus`, `AppOfflineError`), persistent signals
  (`createPersistentSignal`), the offline-aware TanStack query client, session-
  expiry DOM events, axios helpers (`isRequestCanceled`, `sanitizeAxiosError`),
  and date/array helpers. No `@rgo/front-ui` or private-registry coupling.
