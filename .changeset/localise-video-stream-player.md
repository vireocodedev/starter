---
"@vireocodedev/starter-localization": minor
"@vireocodedev/starter-ui": minor
---

Localise `RgoVideoStreamPlayer` error state.

The stream error title, message and retry button were hardcoded English strings
in a published component. They now go through `usePlatformTranslation` like every
other component in the package, with a new `video` section added to the platform
namespace in both `en` and `hr`.

Closes gap F13 from the FRED paper prototype (roadmap 2.4, work item W6).
