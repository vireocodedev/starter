# @vireocodedev/starter-infrastructure

Framework-agnostic **frontend infrastructure utilities** for the vireocodedev
**starter** product. This is the dependency-light, portable core — it has **no
UI-framework coupling**.

The package owns transport-neutral and policy-injected infrastructure. Host
applications still own configured Axios instances, endpoint naming, online and
fallback policy, service-worker registration/UI, and backend diagnostics.

## Install

Published to **GitHub Packages** under the `@vireocodedev` scope:

```bash
npm install @vireocodedev/starter-infrastructure
```

Peers: `react`, `axios`, `zod`, `dayjs`, `@preact/signals-react`,
`@tanstack/react-query`.

## What's included

- **Network status** — `AppOfflineError`, `isAppOfflineError`, `getAppOnlineStatus`,
  `useAppOnlineStatus` (a `useSyncExternalStore` hook).
- **Persistent signals** — `createPersistentSignal`, `PersistentSignal` (a
  `@preact/signals-react` signal mirrored into a storage service).
- **TanStack query client** — `TANSTACK_QUERY_CLIENT` (offline-aware retry/network
  defaults).
- **Session-expiry events** — `notifySessionExpired`, `subscribeToSessionExpiry`,
  `beginManualLogout`, `cancelManualLogout`, `resetSessionExpiryNotification`,
  `APP_SESSION_EXPIRED_EVENT` (a DOM-event pub/sub; the app decides how to react).
- **Axios helpers** — `isRequestCanceled`, `sanitizeAxiosError`,
  `getAxiosRequestPath`, `SanitizedAxiosError`, the injected `AxiosHttpClient`
  base, and typed paged-search helpers.
- **Mode-aware API dispatch** — `transactional`, `createModeAwareApi`, and
  injected online/offline routing, fallback, guard, timing, and diagnostics
  policy.
- **Connectivity** — `createConnectivityState` and
  `QueryReconnectController`, with browser/runtime/query behavior injected by
  the host application.
- **Query factories** — `createPagedSearchQuery` for finite and infinite
  TanStack Query options with neutral abort requests.
- **Service-worker checks** — `useServiceWorkerUpdateChecks` schedules checks
  for an existing registration without owning registration or update UI.
- **Date/array helpers** — `formatDate`, `formatDateTime`, `formatTime`,
  `formatDateUpsert`, `formatDateTimeUpsert`, `formatTimeUpsert`, `findFirstTruthy`.

## Usage

```ts
import {
  getAppOnlineStatus,
  createPersistentSignal,
  TANSTACK_QUERY_CLIENT,
  subscribeToSessionExpiry,
  formatDate,
} from "@vireocodedev/starter-infrastructure";

const unsubscribe = subscribeToSessionExpiry(() => redirectToLogin());
```

## Versioning contract

The exported function/type surface is a contract (add = minor, remove/rename =
major), guarded by the contract test.
