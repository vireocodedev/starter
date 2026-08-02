---
"@vireocodedev/starter-ui": minor
---

Build with `tsc` instead of Vite, and publish subpath exports.

`dist` now mirrors `src` file-for-file rather than being a single rolled-up
bundle, and the package exposes a `./*` subpath export alongside the `.` barrel.
Consumers can import `@vireocodedev/starter-ui/utils/dateFormatters` directly —
which matters for code reachable from web workers and other contexts where
pulling the whole barrel (and its MUI graph) through the bundler is not
acceptable.

Relative specifiers in the emitted JS and `.d.ts` carry `.js` extensions, so
`dist` resolves under Node's ESM loader as well as under bundlers.

`sideEffects` becomes `["**/*.css"]` instead of `false`, so stylesheet imports
survive tree-shaking once the package ships CSS.

The `.` entry point is unchanged; existing barrel imports keep working.
