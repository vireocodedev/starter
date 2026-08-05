---
"@vireocodedev/starter-ui": major
---

Consolidate toast notifications on `sonner` and drop the `react-hot-toast` dependency.

The library previously shipped two competing toast stacks: `AppSnackbarProvider` (sonner) and `RgoSnackbarProvider` (react-hot-toast). `useRgoMutation` emitted its toasts through react-hot-toast, so any app mounting `AppSnackbarProvider` — the documented default — silently dropped every success and error toast.

**Breaking changes**

- `RgoSnackbarProvider` and `RgoSnackbarProviderProps` are removed. Use `AppSnackbarProvider`, which mounts sonner's `Toaster` with responsive placement and theme-aware colors.
- `toast` is now re-exported from `sonner` instead of `react-hot-toast`. Replace `toast(<node />)` with `toast.custom(() => <node />)`, and prefer `toast.success` / `toast.error` / `toast.warning` for plain messages.

`useRgoMutation` now renders through sonner, so its snackbars appear as intended.
