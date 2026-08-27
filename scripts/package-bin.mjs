import { readFileSync } from "node:fs";
import { basename, resolve, sep } from "node:path";

export function resolvePackageBin(packageDirectory, preferredNames = []) {
  const manifest = JSON.parse(readFileSync(resolve(packageDirectory, "package.json"), "utf8"));
  const entries =
    typeof manifest.bin === "string" ? [[basename(manifest.name), manifest.bin]] : Object.entries(manifest.bin ?? {});
  const selected =
    preferredNames.map(name => entries.find(([binName]) => binName === name)).find(Boolean) ??
    (entries.length === 1 ? entries[0] : undefined);

  if (!selected) {
    throw new Error(
      `${manifest.name ?? packageDirectory} does not expose a uniquely identifiable executable` +
        (preferredNames.length > 0 ? ` (${preferredNames.join(", ")})` : "") +
        ".",
    );
  }

  const packageRoot = resolve(packageDirectory);
  const executable = resolve(packageRoot, selected[1]);
  if (!executable.startsWith(`${packageRoot}${sep}`)) {
    throw new Error(`${manifest.name ?? packageDirectory} exposes an executable outside its package directory.`);
  }
  return executable;
}
