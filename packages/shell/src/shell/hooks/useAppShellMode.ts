import { type AppRouteHandle } from "@/config/app.config.routes.types";
import { type AppConfig, type AppShellMode } from "@/config/app.config.types";
import { useMatches } from "react-router";

/**
 * Resolves the shell mode for the current location.
 *
 * `config.shell.mode` is the app-wide default. Any matched route may override it
 * through `handle.shellMode`, and the deepest override wins — so an app can put
 * a full-bleed map or a kiosk view on one branch of the tree while the rest
 * keeps the dashboard chrome.
 */
export function useAppShellMode(config: AppConfig): AppShellMode {
  const matches = useMatches();

  for (let index = matches.length - 1; index >= 0; index--) {
    const shellMode = (matches[index]?.handle as AppRouteHandle | undefined)?.shellMode;
    if (shellMode) return shellMode;
  }

  return config.shell.mode;
}
