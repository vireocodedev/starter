import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateNpmReleaseMavenPrerequisite } from "./npm-release-maven-prerequisite-policy.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workflowsRoot = join(repoRoot, ".github", "workflows");
const policy = JSON.parse(readFileSync(join(repoRoot, "contracts", "github-actions-policy.json"), "utf8"));
const problems = [];
const observedActions = new Set();
const observedWriteJobs = new Set();
const observedWorkflowImages = new Set();

function indentation(line) {
  return line.length - line.trimStart().length;
}

function parseJobs(lines) {
  const jobs = [];
  const jobsLine = lines.findIndex(line => line === "jobs:");
  if (jobsLine < 0) return jobs;

  for (let index = jobsLine + 1; index < lines.length; index += 1) {
    const match = lines[index].match(/^ {2}([A-Za-z0-9_-]+):\s*$/);
    if (!match) continue;
    const start = index;
    let end = lines.length;
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      if (/^ {2}[A-Za-z0-9_-]+:\s*$/.test(lines[cursor])) {
        end = cursor;
        break;
      }
      if (/^[A-Za-z0-9_-]+:/.test(lines[cursor])) {
        end = cursor;
        break;
      }
    }
    jobs.push({ name: match[1], start, end });
    index = end - 1;
  }
  return jobs;
}

function jobForLine(jobs, lineNumber) {
  return jobs.find(job => lineNumber >= job.start && lineNumber < job.end);
}

export function parseJobPermissions(lines, job) {
  const permissions = new Map();
  const permissionLine = lines
    .slice(job.start, job.end)
    .findIndex(line => line === "    permissions:" || line === "    permissions: {}");
  if (permissionLine < 0) return null;
  if (lines[job.start + permissionLine] === "    permissions: {}") return permissions;

  const start = job.start + permissionLine + 1;
  for (let index = start; index < job.end; index += 1) {
    const match = lines[index].match(/^ {6}([A-Za-z-]+): (read|write|none)\s*$/);
    if (!match) break;
    permissions.set(match[1], match[2]);
  }
  return permissions;
}

function hasMainOnlyManualDispatchGuard(lines, job) {
  return lines
    .slice(job.start, job.end)
    .some(
      line =>
        /^ {4}if:/.test(line) &&
        /github\.ref == 'refs\/heads\/main'/.test(line) &&
        (/github\.event_name != 'workflow_dispatch'/.test(line) ||
          /^ {4}if: github\.ref == 'refs\/heads\/main'\s*$/.test(line)),
    );
}

function inspectCheckoutCredentials(fileName, lines, jobs, lineNumber) {
  const job = jobForLine(jobs, lineNumber);
  if (!job) {
    problems.push(`${fileName}:${lineNumber + 1} checkout is outside a job`);
    return;
  }

  const leading = indentation(lines[lineNumber]);
  const stepIndent = lines[lineNumber].trimStart().startsWith("- uses:") ? leading : leading - 2;
  let stepStart = lineNumber;
  while (stepStart > job.start) {
    if (indentation(lines[stepStart]) === stepIndent && lines[stepStart].trimStart().startsWith("- ")) {
      break;
    }
    stepStart -= 1;
  }
  let stepEnd = lineNumber + 1;
  while (stepEnd < job.end) {
    if (indentation(lines[stepEnd]) === stepIndent && lines[stepEnd].trimStart().startsWith("- ")) {
      break;
    }
    stepEnd += 1;
  }

  const key = `${fileName}:${job.name}`;
  const mayPersist = new Set(policy.checkoutCredentialJobs ?? []).has(key);
  const explicitlyDisabled = lines
    .slice(stepStart, stepEnd)
    .some(line => /^\s+persist-credentials: false\s*$/.test(line));
  if (!mayPersist && !explicitlyDisabled) {
    problems.push(`${key} must set checkout persist-credentials: false`);
  }
  if (mayPersist && explicitlyDisabled) {
    problems.push(`${key} is allowed to push but disables checkout credentials`);
  }
}

function mapMatches(actual, expected) {
  return (
    actual instanceof Map &&
    actual.size === expected.size &&
    [...expected].every(([key, value]) => actual.get(key) === value)
  );
}

function actionStep(source, action) {
  const match = source.match(new RegExp(`^([ ]*)(?:- )?uses: ${action}@[^\\s]+(?:\\s+#\\s+[^\\s]+)?\\s*$`, "mu"));
  if (!match || match.index === undefined) return null;
  const usesIndent = match[1];
  const stepIndent = match[0].startsWith(`${usesIndent}- `) ? usesIndent : usesIndent.slice(0, -2);
  const beforeUses = source.slice(0, match.index);
  const stepStart = beforeUses.lastIndexOf(`\n${stepIndent}- `) + 1;
  const afterUses = source.slice(match.index + match[0].length);
  const nextStep = afterUses.search(new RegExp(`^${stepIndent}- (?:name|uses|run):`, "mu"));
  return source.slice(stepStart, nextStep < 0 ? undefined : match.index + match[0].length + nextStep);
}

function releaseRunSteps(lines, job) {
  const commands = [];
  let hasMultilineRun = false;
  for (const line of lines.slice(job.start, job.end)) {
    const match = line.match(/^(?: {6}- | {8})run:\s*(.*)$/u);
    if (!match) continue;
    const command = match[1];
    if (command.length === 0 || /^(?:\||>)[+-]?$/u.test(command)) {
      hasMultilineRun = true;
      continue;
    }
    commands.push(command);
  }
  return { commands, hasMultilineRun };
}

/**
 * The repository setting that permits Actions to create PRs also permits PR
 * approval. This narrow policy keeps the sole PR-writing workflow limited to
 * Changesets version-PR maintenance. It deliberately allowlists operations
 * instead of attempting to enumerate every future approval, merge, publish, or
 * deployment command.
 */
export function validateReleasePrWorkflow(source, actionPolicy) {
  const problems = [];
  const lines = source.split(/\r?\n/);
  const jobs = parseJobs(lines);
  const beforeJobs = source.slice(0, source.indexOf("jobs:"));
  const versionJob = jobs.find(job => job.name === "version");

  if (!/^on:\n {2}push:\n {4}branches: \[main\]\n {2}workflow_dispatch:\s*$/mu.test(beforeJobs)) {
    problems.push("release.yml must run only for pushes to main and manual dispatch");
  }
  if (jobs.length !== 1 || !versionJob) {
    problems.push("release.yml must contain only the version job");
    return problems;
  }
  if (!lines.slice(versionJob.start, versionJob.end).includes("    if: github.ref == 'refs/heads/main'")) {
    problems.push("release.yml:version must restrict every trigger to main");
  }
  if (
    !mapMatches(
      parseJobPermissions(lines, versionJob),
      new Map([
        ["contents", "write"],
        ["pull-requests", "write"],
      ]),
    )
  ) {
    problems.push("release.yml:version must grant exactly contents/pull-requests write permissions");
  }
  if (lines.slice(versionJob.start, versionJob.end).some(line => /^ {4}environment:/u.test(line))) {
    problems.push("release.yml:version may not target a deployment environment");
  }

  const actionReferences = [...source.matchAll(/^[ ]*(?:- )?uses: ([^\s@]+)@[^\s]+/gmu)].map(match => match[1]).sort();
  const expectedActions = ["actions/checkout", "actions/setup-node", "changesets/action"];
  if (JSON.stringify(actionReferences) !== JSON.stringify(expectedActions)) {
    problems.push("release.yml may use only checkout, setup-node, and the reviewed Changesets action");
  }
  const changesetsAction = actionPolicy.actions?.["changesets/action"];
  const changesetsStep = actionStep(source, "changesets/action");
  if (
    !changesetsAction ||
    !changesetsStep?.includes(`uses: changesets/action@${changesetsAction.sha} # ${changesetsAction.version}`)
  ) {
    problems.push("release.yml must pin the reviewed Changesets action");
  }
  const changesetsWithBlock = changesetsStep?.match(/^ {8}with:\n((?:^ {10}[^\n]+\n?)*)/mu)?.[1] ?? "";
  const changesetsInputs = changesetsWithBlock.match(/^ {10}([A-Za-z][A-Za-z-]*): (.+)$/gmu) ?? [];
  const expectedInputs = [
    "          version: corepack npm run version-packages",
    '          commit: "chore(npm): version public packages"',
    '          title: "chore(npm): version public packages"',
  ];
  if (
    changesetsInputs.length !== expectedInputs.length ||
    !expectedInputs.every(input => changesetsInputs.includes(input))
  ) {
    problems.push("release.yml must configure Changesets only to version and open the reviewed release PR");
  }

  const { commands: runCommands, hasMultilineRun } = releaseRunSteps(lines, versionJob);
  if (hasMultilineRun) {
    problems.push("release.yml:version may not use multiline run values");
  }
  if (runCommands.length !== 1 || runCommands[0] !== "corepack npm ci --ignore-scripts") {
    problems.push(
      "release.yml may execute only the lifecycle-script-free install; approval, merge, publication, and deployment commands are prohibited",
    );
  }

  return problems;
}

export function validateAlwaysReportedPullRequestWorkflow(source, fileName) {
  const problems = [];
  const beforePermissions = source.slice(0, source.indexOf("permissions:"));
  if (!/^on:\n {2}pull_request:\s*\n {2}[A-Za-z_-]+:/mu.test(beforePermissions)) {
    problems.push(`${fileName} must run for every pull request without paths or paths-ignore filters`);
  }
  const lines = source.split(/\r?\n/u);
  const plan = parseJobs(lines).find(job => job.name === "plan");
  if (!plan || !lines.slice(plan.start, plan.end).includes("    if: github.event_name == 'pull_request'")) {
    problems.push(`${fileName}:plan must exist and report unconditionally for every pull request`);
  }
  return problems;
}

const workflowFiles = readdirSync(workflowsRoot)
  .filter(file => /\.ya?ml$/.test(file))
  .sort();

for (const fileName of workflowFiles) {
  const source = readFileSync(join(workflowsRoot, fileName), "utf8");
  const lines = source.split(/\r?\n/);
  const jobs = parseJobs(lines);

  if (fileName === "release.yml") problems.push(...validateReleasePrWorkflow(source, policy));
  if (fileName === "release-npm.yml") problems.push(...validateNpmReleaseMavenPrerequisite(source));
  if (fileName === "anonymous-consumer-gauntlet.yml") {
    problems.push(...validateAlwaysReportedPullRequestWorkflow(source, fileName));
  }

  if (source.includes("pull_request_target:")) {
    problems.push(`${fileName} may not use pull_request_target`);
  }
  if (!lines.includes("permissions: {}")) {
    problems.push(`${fileName} must deny permissions at workflow level with permissions: {}`);
  }
  const requiredConcurrency = policy.requiredConcurrencyWorkflows?.[fileName];
  if (requiredConcurrency) {
    const expected = [
      "concurrency:",
      `  group: ${requiredConcurrency.group}`,
      `  cancel-in-progress: ${requiredConcurrency.cancelInProgress}`,
    ];
    if (!expected.every(line => lines.includes(line))) {
      problems.push(`${fileName} must declare the required cancellable concurrency group`);
    }
  }
  if (source.includes("ubuntu-latest")) {
    problems.push(`${fileName} may not use floating ubuntu-latest runners`);
  }
  for (const [lineNumber, line] of lines.entries()) {
    if (/^\s+runs-on: ubuntu-/.test(line) && line.trim() !== "runs-on: ubuntu-24.04") {
      problems.push(`${fileName}:${lineNumber + 1} must use the canonical ubuntu-24.04 runner`);
    }
    if (/^\s+node-version:/.test(line) && line.trim() !== "node-version: 24.18.1") {
      problems.push(`${fileName}:${lineNumber + 1} must pin Node 24.18.1`);
    }
    if (/^\s+run: npm(?:\s|$)/.test(line)) {
      problems.push(`${fileName}:${lineNumber + 1} must invoke the declared npm through Corepack`);
    }
    const imageMatch = line.match(/^\s+image:\s+([^\s]+)\s*$/);
    if (imageMatch) {
      const reference = imageMatch[1];
      const approved = Object.entries(policy.workflowContainerImages ?? {}).find(
        ([image, expected]) => reference === `${image}:${expected.version}@${expected.digest}`,
      );
      if (!approved) problems.push(`${fileName}:${lineNumber + 1} uses an unapproved or unpinned job container`);
      else observedWorkflowImages.add(approved[0]);
    }
  }

  for (let lineNumber = 0; lineNumber < lines.length; lineNumber += 1) {
    const match = lines[lineNumber].match(/\buses:\s+([^\s@]+)@([^\s#]+)(?:\s+#\s+([^\s]+))?/);
    if (!match || match[1].startsWith("./")) continue;

    const [, action, reference, versionComment] = match;
    const expected = policy.actions?.[action];
    observedActions.add(action);
    if (!expected) {
      problems.push(`${fileName}:${lineNumber + 1} uses unapproved action ${action}`);
      continue;
    }
    if (!/^[0-9a-f]{40}$/.test(reference)) {
      problems.push(`${fileName}:${lineNumber + 1} must pin ${action} to a full commit SHA`);
    } else if (reference !== expected.sha) {
      problems.push(`${fileName}:${lineNumber + 1} ${action} does not match its approved SHA`);
    }
    if (versionComment !== expected.version) {
      problems.push(`${fileName}:${lineNumber + 1} ${action} must retain version comment ${expected.version}`);
    }
    if (action === "actions/checkout") {
      inspectCheckoutCredentials(fileName, lines, jobs, lineNumber);
    }
    if (action === "actions/setup-node") {
      const job = jobForLine(jobs, lineNumber);
      if (!job) {
        problems.push(`${fileName}:${lineNumber + 1} setup-node is outside a job`);
      } else if (lines.slice(job.start, lineNumber).some(candidate => candidate.includes("actions/checkout@"))) {
        problems.push(
          `${fileName}:${job.name} must run setup-node before checkout so the runner's bundled npm does not evaluate the strict devEngines policy`,
        );
      }
    }
  }

  for (const job of jobs) {
    if (!lines.slice(job.start, job.end).some(line => /^ {4}timeout-minutes: \d+\s*$/.test(line))) {
      problems.push(`${fileName}:${job.name} must declare timeout-minutes`);
    }

    const permissions = parseJobPermissions(lines, job);
    if (!permissions) {
      problems.push(`${fileName}:${job.name} must declare explicit job permissions`);
      continue;
    }
    const writes = [...permissions]
      .filter(([, access]) => access === "write")
      .map(([scope]) => scope)
      .sort();
    if (writes.length === 0) continue;

    const key = `${fileName}:${job.name}`;
    observedWriteJobs.add(key);
    const expectedWrites = [...(policy.writePermissionJobs?.[key] ?? [])].sort();
    if (JSON.stringify(writes) !== JSON.stringify(expectedWrites)) {
      problems.push(`${key} has write permissions [${writes.join(", ")}], expected [${expectedWrites.join(", ")}]`);
    }
    if (
      /^ {2}pull_request:/m.test(source.slice(0, source.indexOf("jobs:"))) &&
      !(policy.pullRequestWriteJobs ?? []).includes(key)
    ) {
      problems.push(`${key} has write access in a pull-request-triggered workflow`);
    }
    if (/^ {2}workflow_dispatch:/m.test(source.slice(0, source.indexOf("jobs:"))) && writes.length > 0) {
      if (!(policy.mainOnlyManualWriteJobs ?? []).includes(key)) {
        problems.push(`${key} must be approved for main-only workflow_dispatch write access`);
      }
      if (!hasMainOnlyManualDispatchGuard(lines, job)) {
        problems.push(`${key} must restrict workflow_dispatch write access to refs/heads/main`);
      }
    }
  }
}

for (const action of Object.keys(policy.actions ?? {})) {
  if (!observedActions.has(action)) problems.push(`Action policy contains unused entry ${action}`);
}
for (const key of Object.keys(policy.writePermissionJobs ?? {})) {
  if (!observedWriteJobs.has(key)) problems.push(`Write-permission policy contains unused entry ${key}`);
}
for (const key of policy.pullRequestWriteJobs ?? []) {
  if (!observedWriteJobs.has(key)) problems.push(`Pull-request write policy contains unused entry ${key}`);
}
for (const key of policy.mainOnlyManualWriteJobs ?? []) {
  if (!observedWriteJobs.has(key)) problems.push(`Manual write policy contains unused entry ${key}`);
}
for (const image of Object.keys(policy.workflowContainerImages ?? {})) {
  if (!observedWorkflowImages.has(image)) problems.push(`Workflow image policy contains unused entry ${image}`);
}

const secretScan = readFileSync(join(repoRoot, "scripts", "secret-scan.sh"), "utf8");
for (const [image, expected] of Object.entries(policy.containerImages ?? {})) {
  const pinnedReference = `${image}@${expected.digest}`;
  if (!secretScan.includes(pinnedReference)) {
    problems.push(`Secret scanner must pin ${image} ${expected.version} to ${expected.digest}`);
  }
}

if (policy.schemaVersion !== 1) {
  problems.push(`Unsupported GitHub Actions policy schema version ${policy.schemaVersion}`);
}

if (problems.length > 0) {
  console.error("Workflow security policy failed:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `Workflow security policy passed: ${workflowFiles.length} workflows, ${observedActions.size} pinned actions, ${observedWriteJobs.size} privileged jobs.`,
);
