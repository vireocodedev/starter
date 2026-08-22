---
"@vireocodedev/starter-localization": major
"@vireocodedev/starter-ui": minor
"@vireocodedev/starter-shell": patch
---

Make `starter-localization` framework-free and worker-safe by moving the three
`react-i18next` namespace hooks to `starter-ui/react-i18next`. Remove the legacy
platform resource aliases, deeply isolate generated locale resources, reject
invalid factory configuration, and harden merge behavior against prototype
mutation.

Update Starter Shell to consume the UI-owned platform translation hook.
