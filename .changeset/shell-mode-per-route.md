---
"@vireocodedev/starter-shell": minor
---

Shell mode is now resolved per route, and actually drives the layout.

`config.shell.mode` was declared, validated, and then read by nothing — the app
had to import a layout preset and wire it into the route tree by hand, which
made the config field decorative and the choice permanent for the whole app.

`AppShellModeLayout` closes the loop. It picks the preset that matches the
resolved mode:

```tsx
<AppShellModeLayout config={APP_CONFIG} runtime={runtime} />
```

`config.shell.mode` remains the app-wide default. Any route may override it via
`handle.shellMode`, and the deepest matched override wins:

```ts
{
  path: "map",
  element: <MapPage />,
  handle: { shellMode: "bare" },
}
```

That is what both paper prototypes needed and neither could express: FRED's map
is full-bleed while its admin pages are not, and LMS varies its chrome by role.

`useAppShellMode(config)` is exported for apps that need the resolved mode
without the layout.

Additive — the presets are still exported and still work when imported directly.

Closes gaps G7 and F3, and resolves G8 (roadmap 2.4, work item W2).
