import assert from "node:assert/strict";
import { appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const npmPublicationJob = "Publish authorized npm packages";
export const jvmFinalizationJob = "Verify and finalize immutable JVM release";
const knownConclusions = new Set([
  "success",
  "skipped",
  "failure",
  "cancelled",
  "timed_out",
  "action_required",
  "neutral",
]);

export function classifyCombinedReleaseJobs(jobs) {
  if (!Array.isArray(jobs)) throw new Error("GitHub Actions jobs response must be an array.");
  const required = [npmPublicationJob, jvmFinalizationJob];
  const outcomes = new Map();
  for (const name of required) {
    const matches = jobs.filter(job => job?.name === name);
    if (matches.length === 0) throw new Error(`Expected exactly one logical ${name} job in the parent release run.`);
    const attempts = matches.map(job => job.run_attempt);
    if (attempts.some(attempt => !Number.isSafeInteger(attempt) || attempt < 1))
      throw new Error(`${name} has an invalid run_attempt.`);
    const latestAttempt = Math.max(...attempts);
    const latest = matches.filter(job => job.run_attempt === latestAttempt);
    if (latest.length !== 1) throw new Error(`${name} has duplicate latest run_attempt evidence.`);
    const conclusion = latest[0].conclusion;
    if (!knownConclusions.has(conclusion))
      throw new Error(`${name} has an unknown or incomplete conclusion: ${String(conclusion)}.`);
    outcomes.set(name, conclusion);
  }
  const npmActive = outcomes.get(npmPublicationJob) === "success";
  const jvmActive = outcomes.get(jvmFinalizationJob) === "success";
  return { npmActive, jvmActive, anyActivity: npmActive || jvmActive };
}

export async function loadParentRunActivity(fetchImpl, { repository, runId, token }) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(repository ?? "")) throw new Error("GITHUB_REPOSITORY is required.");
  if (!/^\d+$/u.test(String(runId))) throw new Error("PARENT_RUN_ID must be an exact Actions run id.");
  if (typeof token !== "string" || token.length === 0)
    throw new Error("GITHUB_TOKEN is required to inspect parent workflow jobs.");
  const response = await fetchImpl(
    `https://api.github.com/repos/${repository}/actions/runs/${runId}/jobs?filter=all&per_page=100`,
    {
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!response.ok) throw new Error(`Parent release job lookup returned HTTP ${response.status}.`);
  const payload = await response.json();
  if (
    !Number.isInteger(payload?.total_count) ||
    !Array.isArray(payload?.jobs) ||
    payload.total_count !== payload.jobs.length
  )
    throw new Error("Parent release jobs response is incomplete or malformed.");
  return classifyCombinedReleaseJobs(payload.jobs);
}

function writeOutput(activity) {
  const append = line => appendFileSync(process.env.GITHUB_OUTPUT, line);
  append(`npm-active=${activity.npmActive}\n`);
  append(`jvm-active=${activity.jvmActive}\n`);
  append(`any-activity=${activity.anyActivity}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  assert.equal(process.env.GITHUB_ACTIONS, "true", "Release activity inspection is restricted to GitHub Actions.");
  const activity = await loadParentRunActivity(fetch, {
    repository: process.env.GITHUB_REPOSITORY,
    runId: process.env.PARENT_RUN_ID,
    token: process.env.GITHUB_TOKEN,
  });
  if (!process.env.GITHUB_OUTPUT) throw new Error("GITHUB_OUTPUT is required.");
  writeOutput(activity);
  console.log(JSON.stringify(activity));
}
