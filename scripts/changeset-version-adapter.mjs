import { spawnSync } from "node:child_process";
import { existsSync, symlinkSync, unlinkSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { synchronizeDocumentationRelease } from "./synchronize-documentation-release.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const localNpx = join(repositoryRoot, "node_modules", ".bin", "npx");
const declaredNpx = join(repositoryRoot, "scripts", "with-declared-npx.sh");

if (existsSync(localNpx)) {
  throw new Error(`Refusing to replace an existing local npx executable: ${localNpx}`);
}

symlinkSync(relative(dirname(localNpx), declaredNpx), localNpx);
try {
  const result = spawnSync("changeset", ["version", ...process.argv.slice(2)], {
    cwd: repositoryRoot,
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
  else await synchronizeDocumentationRelease(repositoryRoot);
} finally {
  unlinkSync(localNpx);
}
