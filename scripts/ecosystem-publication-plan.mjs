import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const stableVersion = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u;

function readJson(path, repositoryRoot = root) {
  return JSON.parse(readFileSync(join(repositoryRoot, path), "utf8"));
}
function manifestVersions(repositoryRoot, revision = null) {
  const policy = readJson("contracts/ecosystem-publication-policy.json", repositoryRoot);
  const names = [policy.cli, ...policy.classicLibraries];
  const directories = new Map([
    ["create-vireo", "create-vireo"],
    ["@vireocodedev/history", "history"],
    ["@vireocodedev/infrastructure", "infrastructure"],
    ["@vireocodedev/localization", "localization"],
    ["@vireocodedev/query", "queryengine"],
    ["@vireocodedev/shell", "shell"],
    ["@vireocodedev/sqlite", "sqlite"],
    ["@vireocodedev/ui", "ui"],
  ]);
  const value = {};
  for (const name of names) {
    const path = `packages/${directories.get(name)}/package.json`;
    const content = revision
      ? execFileSync("git", ["show", `${revision}:${path}`], { cwd: repositoryRoot, encoding: "utf8" })
      : readFileSync(join(repositoryRoot, path), "utf8");
    value[name] = JSON.parse(content).version;
  }
  return value;
}
function jvmVersion(repositoryRoot, revision = null) {
  const content = revision
    ? execFileSync("git", ["show", `${revision}:jvm/gradle.properties`], { cwd: repositoryRoot, encoding: "utf8" })
    : readFileSync(join(repositoryRoot, "jvm/gradle.properties"), "utf8");
  return /^version=(.+)$/mu.exec(content)?.[1] ?? null;
}
function changed(before, after) {
  return Object.keys(after).filter(name => before[name] !== after[name]);
}
function assertIncreasing(name, before, after) {
  if (!stableVersion.test(before) || !stableVersion.test(after) || before === after)
    throw new Error(`${name} must advance a stable semantic version.`);
  const a = before.split(".").map(Number);
  const b = after.split(".").map(Number);
  if (
    b.every((part, index) => part === a[index]) ||
    b.find((part, index) => part !== a[index]) < a[b.findIndex((part, index) => part !== a[index])]
  )
    throw new Error(`${name} must advance its semantic version.`);
}

export function planEcosystemPublication({
  before,
  after,
  associatedPullRequests = [],
  policy,
  templateAction = "no-op",
}) {
  const problems = [];
  const classic = policy.classicLibraries;
  const npmChanged = changed(before.npm, after.npm);
  const classicChanged = npmChanged.filter(name => classic.includes(name));
  const cliChanged = npmChanged.includes(policy.cli);
  const jvmChanged = before.jvm !== after.jvm;
  const releaseLooking = npmChanged.length > 0 || jvmChanged;
  if (!releaseLooking)
    return { action: "no-op", reason: "No public ecosystem coordinate changed.", classicCoordinates: [] };
  if (
    cliChanged &&
    classicChanged.length === 0 &&
    !jvmChanged &&
    ["publish-create-vireo", "recover-create-vireo"].includes(templateAction)
  )
    return {
      action: "no-op",
      reason: "Immutable Template adoption owns this CLI-only release.",
      classicCoordinates: [],
    };
  if (cliChanged && !["publish-create-vireo", "recover-create-vireo"].includes(templateAction))
    problems.push(
      "create-vireo is owned exclusively by immutable Template adoption and cannot be part of an ecosystem release.",
    );
  if (cliChanged && (classicChanged.length > 0 || jvmChanged))
    problems.push("create-vireo Template adoption cannot be mixed with classic-library or JVM publication.");
  for (const name of [...classicChanged, ...(jvmChanged ? ["JVM"] : [])]) {
    try {
      assertIncreasing(
        name,
        name === "JVM" ? before.jvm : before.npm[name],
        name === "JVM" ? after.jvm : after.npm[name],
      );
    } catch (error) {
      problems.push(error.message);
    }
  }
  if (associatedPullRequests.length !== 1)
    problems.push("A release-looking main push must have exactly one associated pull request.");
  const pr = associatedPullRequests[0];
  const expected = policy.generatedReleasePullRequest;
  if (pr) {
    if (pr.merge_commit_sha !== after.sha)
      problems.push("Associated pull request merge_commit_sha must equal GITHUB_SHA.");
    if (typeof pr.merged_at !== "string" || pr.merged_at.length === 0)
      problems.push("Associated pull request must expose a GitHub merged_at timestamp.");
    if (pr.base?.ref !== expected.base || pr.head?.ref !== expected.head)
      problems.push("Associated pull request must use the exact generated release branch pair.");
    if (pr.base?.repo?.full_name !== expected.repository || pr.head?.repo?.full_name !== expected.repository)
      problems.push("Associated pull request repositories must be the canonical Vireo repository.");
    if (pr.user?.id !== expected.authorId || pr.user?.login !== expected.authorLogin)
      problems.push("Associated pull request author must be the exact reviewed GitHub App bot identity.");
    if (pr.title !== expected.title)
      problems.push("Associated pull request title is not the exact ecosystem release title.");
  }
  if (problems.length) return { action: "fail", reason: problems.join(" "), classicCoordinates: [] };
  const classicCoordinates = classicChanged.map(name => `${name}@${after.npm[name]}`);
  const action =
    jvmChanged && classicChanged.length ? "jvm-then-libraries" : jvmChanged ? "jvm-only" : "libraries-only";
  return {
    action,
    reason: "Exact generated ecosystem release PR authorized publication.",
    classicCoordinates,
    jvmVersion: jvmChanged ? after.jvm : null,
  };
}

function validateSynchronizedContract(repositoryRoot, npm, jvm) {
  const contract = readJson("contracts/ecosystem-release-contract.json", repositoryRoot);
  const current = Object.fromEntries((contract.current?.npm ?? []).map(item => [item.name, item.version]));
  for (const [name, version] of Object.entries(npm))
    if (current[name] !== version) throw new Error(`Ecosystem contract is not synchronized for ${name}.`);
  if (contract.current?.maven?.version !== jvm)
    throw new Error("Ecosystem contract is not synchronized for the JVM version.");
  if (!readFileSync(join(repositoryRoot, "jvm/CHANGELOG.md"), "utf8").includes(`## ${jvm}`))
    throw new Error("JVM changelog does not contain the planned JVM version.");
}
async function githubJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${process.env.GITHUB_TOKEN ?? ""}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`GitHub release authorization lookup returned HTTP ${response.status}.`);
  return response.json();
}
function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}
function output(plan) {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `action=${plan.action}\n`);
    appendFileSync(process.env.GITHUB_OUTPUT, `classic-coordinates=${JSON.stringify(plan.classicCoordinates)}\n`);
    appendFileSync(process.env.GITHUB_OUTPUT, `jvm-version=${plan.jvmVersion ?? ""}\n`);
  }
  console.log(JSON.stringify(plan));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (
    process.env.GITHUB_ACTIONS !== "true" ||
    process.env.GITHUB_REF !== "refs/heads/main" ||
    !/^[a-f0-9]{40}$/u.test(process.env.GITHUB_SHA ?? "")
  )
    throw new Error("Ecosystem publication planning is restricted to a protected main GitHub Actions push.");
  const head = git(["rev-parse", "HEAD"]);
  if (head !== process.env.GITHUB_SHA) throw new Error("Checked-out release commit does not equal GITHUB_SHA.");
  const parent = git(["rev-parse", "HEAD^"]);
  const policy = readJson("contracts/ecosystem-publication-policy.json");
  const before = { npm: manifestVersions(root, parent), jvm: jvmVersion(root, parent) };
  const after = { npm: manifestVersions(root), jvm: jvmVersion(root), sha: head };
  validateSynchronizedContract(root, after.npm, after.jvm);
  const releaseLooking = changed(before.npm, after.npm).length > 0 || before.jvm !== after.jvm;
  const prs = releaseLooking
    ? await githubJson(
        `https://api.github.com/repos/${policy.generatedReleasePullRequest.repository}/commits/${head}/pulls`,
      )
    : [];
  const plan = planEcosystemPublication({
    before,
    after,
    associatedPullRequests: prs,
    policy,
    templateAction: process.env.TEMPLATE_ACTION,
  });
  output(plan);
  if (plan.action === "fail") throw new Error(plan.reason);
}
