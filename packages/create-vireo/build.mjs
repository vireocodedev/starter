import { rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { build, context } from "esbuild";

const watch = process.argv.includes("--watch");
await rm("dist", { recursive: true, force: true });
const options = {
  entryPoints: ["src/index.ts", "src/cli.ts", "src/vireo-cli.ts", "src/project-upgrade.ts"],
  outdir: "dist",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node24",
  external: ["prettier"],
  sourcemap: false,
  banner: { js: "#!/usr/bin/env node" },
};

if (watch) {
  const buildContext = await context(options);
  await buildContext.watch();
} else {
  await build(options);
  const declarations = spawnSync("tsc", ["-p", "tsconfig.json"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (declarations.status !== 0) process.exit(declarations.status ?? 1);
}
