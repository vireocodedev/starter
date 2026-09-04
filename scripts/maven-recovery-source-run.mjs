import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policy = JSON.parse(readFileSync(resolve(root, "contracts/ecosystem-publication-policy.json"), "utf8"));

export function validateMavenRecoverySourceRun(run, { repository, sourceCommit, workflow = policy.ecosystemWorkflow }) {
  const allowedConclusions = new Set(["failure", "cancelled", "timed_out"]);
  const acceptedNames = new Set([workflow?.name, ...(workflow?.historicalNames ?? [])]);
  const path = String(run?.path ?? "");
  if (
    run?.repository?.full_name !== repository ||
    run?.workflow_id !== workflow?.id ||
    (path !== workflow?.path && path !== `${workflow?.path}@main` && path !== `${workflow?.path}@refs/heads/main`) ||
    !acceptedNames.has(run?.name) ||
    run?.event !== "push" ||
    run?.head_branch !== "main" ||
    run?.head_sha !== sourceCommit ||
    run?.status !== "completed" ||
    !allowedConclusions.has(run?.conclusion)
  )
    throw new Error("source_run_id is not the exact interrupted ecosystem release run for source_commit.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  validateMavenRecoverySourceRun(JSON.parse(readFileSync(process.env.SOURCE_RUN, "utf8")), {
    repository: process.env.GITHUB_REPOSITORY,
    sourceCommit: process.env.SOURCE_COMMIT,
  });
}
