# @vireocodedev/starter-infrastructure

Framework-agnostic **frontend infrastructure utilities** for the vireocodedev
**starter** product. This is the dependency-light, portable core — it has **no
UI-framework or private-registry coupling**.

> The `@rgo/front-ui`-coupled pieces (the `AxiosHttpClient` base, the axios/query
> React providers, and the local-storage service) intentionally stay in the host
> application, mirroring how the query engine keeps its HTTP adapter app-side.

## Install

Published to **GitHub Packages** under the `@vireocodedev` scope:

```bash
npm install @vireocodedev/starter-infrastructure
```

Peers: `react`, `axios`, `dayjs`, `@preact/signals-react`, `@tanstack/react-query`.

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
  `getAxiosRequestPath`, `SanitizedAxiosError`.
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
