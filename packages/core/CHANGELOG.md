# @vireocodedev/starter-core

## 0.2.0

### Minor Changes

- 4ecc2fe: Initial release of the app-shell framework: config/sitemap/routing scaffolding
  (`definePages`, `defineRoutes`, `appNav`, `routePath` helpers, typed config
  contracts), route guards, the responsive shell + navigation (header, side nav,
  mobile bottom nav, window-controls-overlay), and the bare/dashboard/public shell
  layout presets. Peers include react-router and MUI; `AppPwaUpdateBanner`
  requires `vite-plugin-pwa` in the consuming build.
