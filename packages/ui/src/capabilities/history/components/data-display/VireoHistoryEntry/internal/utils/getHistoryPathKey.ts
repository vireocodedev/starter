import type { HistoryPath } from "@vireocodedev/history";

export function getHistoryPathKey(path: HistoryPath): string {
  return path.length === 0 ? "$root" : `$path:${JSON.stringify(path)}`;
}
