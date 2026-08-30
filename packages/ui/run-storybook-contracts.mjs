import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const vitestCli = fileURLToPath(new URL("../../node_modules/vitest/vitest.mjs", import.meta.url));
const projects = [
  "storybook-desktop-dark",
  "storybook-mobile-dark",
  "storybook-light",
  "storybook-reduced-motion",
  "storybook-rtl",
  "storybook-forced-colors",
  "storybook-mobile-landscape",
];

for (const project of projects) {
  const result = spawnSync(
    process.execPath,
    [vitestCli, "--config", "vitest.storybook.config.ts", "--run", "--project", project],
    {
      cwd: import.meta.dirname,
      env: { ...process.env, VIREO_STORYBOOK_CONTRACTS: "true" },
      stdio: "inherit",
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
