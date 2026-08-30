---
"@vireocodedev/ui": minor
---

Remove the two free-solo field implementations from the direct `@vireocodedev/ui/forms` runtime surface. Their types and utility classes remain public; render them through the `useVireoForm` field facade, consistently with the other form-bound fields.
