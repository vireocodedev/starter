import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workflowsRoot = join(repoRoot, ".github", "workflows");
const policy = JSON.parse(readFileSync(join(repoRoot, "contracts", "github-actions-policy.json"), "utf8"));
const problems = [];
const observedActions = new Set();
const observedWriteJobs = new Set();

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

function parseJobPermissions(lines, job) {
  const permissions = new Map();
  const permissionLine = lines.slice(job.start, job.end).findIndex(line => line === "    permissions:");
  if (permissionLine < 0) return null;

  const start = job.start + permissionLine + 1;
  for (let index = start; index < job.end; index += 1) {
    const match = lines[index].match(/^ {6}([A-Za-z-]+): (read|write|none)\s*$/);
    if (!match) break;
    permissions.set(match[1], match[2]);
  }
  return permissions;
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

const workflowFiles = readdirSync(workflowsRoot)
  .filter(file => /\.ya?ml$/.test(file))
  .sort();

for (const fileName of workflowFiles) {
  const source = readFileSync(join(workflowsRoot, fileName), "utf8");
  const lines = source.split(/\r?\n/);
  const jobs = parseJobs(lines);

  if (source.includes("pull_request_target:")) {
    problems.push(`${fileName} may not use pull_request_target`);
  }
  if (!lines.includes("permissions: {}")) {
    problems.push(`${fileName} must deny permissions at workflow level with permissions: {}`);
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
  }

  for (const job of jobs) {
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
    if (/^ {2}pull_request:/m.test(source.slice(0, source.indexOf("jobs:")))) {
      problems.push(`${key} has write access in a pull-request-triggered workflow`);
    }
  }
}

for (const action of Object.keys(policy.actions ?? {})) {
  if (!observedActions.has(action)) problems.push(`Action policy contains unused entry ${action}`);
}
for (const key of Object.keys(policy.writePermissionJobs ?? {})) {
  if (!observedWriteJobs.has(key)) problems.push(`Write-permission policy contains unused entry ${key}`);
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
