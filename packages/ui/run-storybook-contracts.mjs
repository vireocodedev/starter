import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const vitestCli = fileURLToPath(new URL("../../node_modules/vitest/vitest.mjs", import.meta.url));
const projects = [
  { matrixCorpus: false, name: "storybook-desktop-dark" },
  { matrixCorpus: true, name: "storybook-mobile-dark" },
  { matrixCorpus: true, name: "storybook-light" },
  { matrixCorpus: true, name: "storybook-reduced-motion" },
  { matrixCorpus: true, name: "storybook-rtl" },
  { matrixCorpus: true, name: "storybook-forced-colors" },
  { matrixCorpus: true, name: "storybook-mobile-landscape" },
];

for (const project of projects) {
  const environment = { ...process.env, VIREO_STORYBOOK_CONTRACTS: "true" };
  if (project.matrixCorpus) environment.VIREO_STORYBOOK_MATRIX = "true";
  else delete environment.VIREO_STORYBOOK_MATRIX;

  const result = spawnSync(
    process.execPath,
    [vitestCli, "--config", "vitest.storybook.config.ts", "--run", "--project", project.name],
    {
      cwd: import.meta.dirname,
      env: environment,
      stdio: "inherit",
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
