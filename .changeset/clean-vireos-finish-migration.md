---
"@vireocodedev/starter-ui": major
---

Remove the final legacy runtime contracts now that their Vireo replacements are complete. This removes `RgoLocalStorageService`, `RgoMuiColor`, obsolete generic type helpers, and the deprecated `AppBottomDrawer`, `DockedSidePanel`, `ResponsiveOverlayFrame`, and `SidePanelResizeHandle` adapters. Use the corresponding `Vireo*` overlays and keep browser persistence in application or infrastructure code.
