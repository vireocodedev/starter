import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
const lockfile = JSON.parse(readFileSync(join(repoRoot, "package-lock.json"), "utf8"));
const uiManifest = JSON.parse(readFileSync(join(repoRoot, "packages", "ui", "package.json"), "utf8"));
const platformPolicy = JSON.parse(readFileSync(join(repoRoot, "contracts", "platform-support-policy.json"), "utf8"));
const problems = [];

const expected = {
  nodeRange: platformPolicy.toolchains.node.range,
  npmVersion: platformPolicy.toolchains.npm.exact,
  packageManager: `npm@${platformPolicy.toolchains.npm.exact}`,
  peers: {
    "@emotion/react": ">=11.14 <12",
    "@emotion/styled": ">=11.14 <12",
    "@mui/icons-material": platformPolicy.toolchains.mui,
    "@mui/material": platformPolicy.toolchains.mui,
    "@mui/x-date-pickers": platformPolicy.toolchains.mui,
    "@tanstack/react-form": ">=1.33 <2",
    "@tanstack/react-query": ">=5.80 <6",
    react: platformPolicy.toolchains.react,
    "react-dom": platformPolicy.toolchains.react,
  },
};

function requireEqual(label, actual, wanted) {
  if (actual !== wanted) problems.push(`${label} is ${JSON.stringify(actual)}, expected ${JSON.stringify(wanted)}`);
}

requireEqual("packageManager", manifest.packageManager, expected.packageManager);
requireEqual("Node engine", manifest.engines?.node, expected.nodeRange);
requireEqual("npm engine", manifest.engines?.npm, expected.npmVersion);
requireEqual("development Node policy", manifest.devEngines?.runtime?.version, expected.nodeRange);
requireEqual("development npm policy", manifest.devEngines?.packageManager?.version, expected.npmVersion);
requireEqual("lockfile Node engine", lockfile.packages?.[""]?.engines?.node, expected.nodeRange);
requireEqual("lockfile npm engine", lockfile.packages?.[""]?.engines?.npm, expected.npmVersion);

for (const [name, range] of Object.entries(expected.peers)) {
  requireEqual(`${name} peer range`, uiManifest.peerDependencies?.[name], range);
}

const [nodeMajor, nodeMinor] = process.versions.node.split(".").map(Number);
if (nodeMajor !== 24 || nodeMinor < 15) {
  problems.push(`running Node is ${process.versions.node}, expected ${expected.nodeRange}`);
}

const npmVersion = process.env.npm_config_user_agent?.match(/^npm\/([^\s]+)/)?.[1];
if (!npmVersion) {
  problems.push("npm version is unavailable; run this check through `corepack npm run toolchain:check`");
} else {
  requireEqual("running npm", npmVersion, expected.npmVersion);
}

if (problems.length > 0) {
  console.error("Toolchain policy failed:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`Toolchain policy passed: Node ${process.versions.node}, npm ${npmVersion}, React 19.2, MUI 9.`);
