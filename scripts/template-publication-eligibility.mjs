import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function templatePublicationEligibility({ changedCli, intent }) {
  if (changedCli) return { shouldPlan: true, reason: "create-vireo coordinate changed" };
  if (intent?.status !== "adopted") return { shouldPlan: true, reason: "Template adoption remains pending" };
  return { shouldPlan: false, reason: "No CLI coordinate change or pending Template adoption" };
}

export function createVireoVersionChanged({ parentManifest, currentManifest }) {
  if (typeof parentManifest?.version !== "string" || typeof currentManifest?.version !== "string")
    throw new Error("create-vireo manifests must contain semantic version strings.");
  return parentManifest.version !== currentManifest.version;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const parent = execFileSync("git", ["rev-parse", "HEAD^"], { cwd: root, encoding: "utf8" }).trim();
  const parentManifest = JSON.parse(
    execFileSync("git", ["show", `${parent}:packages/create-vireo/package.json`], { cwd: root, encoding: "utf8" }),
  );
  const currentManifest = JSON.parse(readFileSync(join(root, "packages/create-vireo/package.json"), "utf8"));
  const changedCli = createVireoVersionChanged({ parentManifest, currentManifest });
  const intent = JSON.parse(readFileSync(join(root, "contracts/template-adoption-intent.json"), "utf8"));
  const result = templatePublicationEligibility({ changedCli, intent });
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `should-plan=${result.shouldPlan}\n`);
  console.log(JSON.stringify(result));
}
