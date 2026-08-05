---
"@vireocodedev/starter-shell": minor
---

Permissions can now be evaluated against a scope.

A permission alone answers "may this role ever do X". Both second-domain apps
needed the narrower question "may this user do X _here_" and neither could
express it: LMS scopes by the shift a user is on duty for, FRED by the tenant
that owns the record (`companyId`, enforced server-side by `CompanyIdValidator`).

`runtime.permissions.canAccess` now takes an optional second argument:

```ts
canAccess: (permission: string | undefined, scope?: AppPermissionScope) => boolean;
```

`AppPermissionScope` is an opaque `Record<string, unknown>` — the starter does
not know what an app's scoping dimensions are, so the app's own `canAccess`
implementation interprets it.

A static `permissionScope` can be declared anywhere a `permission` already can:
nav entries (`appNav.item`, `disabledItem`, `control`, `slot`), page and section
definitions, mobile bottom nav items, nav control configs, and route handles. The
nav visibility filter, the mobile bottom navigation, the public shell layout and
`AppRouteGuardLayout` all pass it through.

Scopes that vary per record can only be known at the call site, so two hooks are
exported for that: `useAppPermissions()` returns the checker, and `useAppCan()`
resolves one permission:

```tsx
<RgoShowIf when={useAppCan("lockage:finalize", { shiftId })}>
  <FinalizeButton />
</RgoShowIf>
```

Fully additive. An existing `(permission) => boolean` implementation stays
assignable and every existing call site keeps working.

Closes gaps G11 and F17 — the highest-ranked structural theme from both paper
prototypes (roadmap 2.4, work item W1).
