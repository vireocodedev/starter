import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policy = JSON.parse(readFileSync(join(root, "contracts/public-beta-evidence-policy.json"), "utf8"));
const aggregate = JSON.parse(readFileSync(join(root, policy.aggregatePath), "utf8"));
const problems = [];

function walk(value, path = "aggregate") {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (policy.disallowedAggregateKeys.includes(key)) problems.push(`${path}.${key} is forbidden identity data`);
    walk(child, `${path}.${key}`);
  }
}
walk(aggregate);

if (aggregate.schemaVersion !== policy.schemaVersion) problems.push("aggregate schemaVersion must match policy");
if (!/^\d{4}-\d{2}-\d{2}$/u.test(aggregate.updatedAt)) problems.push("updatedAt must use YYYY-MM-DD");

const sessions = aggregate.workflowSessions;
const outcomes = [sessions.completedWithoutHelp, sessions.completedWithHelp, sessions.blocked, sessions.abandoned];
const numericValues = [
  sessions.total,
  ...outcomes,
  ...Object.values(sessions.taskAttempts),
  ...Object.values(aggregate.adoption),
];
if (numericValues.some(value => !Number.isSafeInteger(value) || value < 0)) {
  problems.push("all aggregate counters must be non-negative safe integers");
}
if (outcomes.reduce((sum, value) => sum + value, 0) !== sessions.total) {
  problems.push("workflow outcome counts must sum to workflowSessions.total");
}
for (const task of policy.requiredTasks) {
  if (!(task in sessions.taskAttempts)) problems.push(`missing required task counter ${task}`);
  else if (sessions.taskAttempts[task] > sessions.total) problems.push(`${task} attempts cannot exceed total sessions`);
}

for (const form of ["public_beta_feedback.yml", "adopter_check_in.yml"]) {
  const contents = readFileSync(join(root, ".github", "ISSUE_TEMPLATE", form), "utf8");
  for (const fragment of ["privacy", "required: true"]) {
    if (!contents.toLowerCase().includes(fragment)) problems.push(`${form} must contain ${fragment}`);
  }
}

if (problems.length > 0) {
  console.error("Public-beta evidence policy failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

const gate =
  aggregate.adoption.qualifyingActiveTeams >= policy.qualifyingTeamMinimum &&
  aggregate.adoption.maintainedDeploymentUpgrades >= policy.maintainedDeploymentUpgradeMinimum;
const summary = {
  schemaVersion: policy.schemaVersion,
  generatedAt: new Date().toISOString(),
  aggregateUpdatedAt: aggregate.updatedAt,
  workflowSessions: sessions.total,
  qualifyingActiveTeams: aggregate.adoption.qualifyingActiveTeams,
  maintainedDeploymentUpgrades: aggregate.adoption.maintainedDeploymentUpgrades,
  gate: gate ? "PASS" : "HOLD",
};

if (process.argv.includes("--write")) {
  const output = join(root, ".public-beta-evidence", "latest.json");
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(summary, null, 2)}\n`);
}

console.log(
  `Public-beta evidence passed: ${sessions.total} sessions, ${aggregate.adoption.qualifyingActiveTeams}/${policy.qualifyingTeamMinimum} teams, ${aggregate.adoption.maintainedDeploymentUpgrades}/${policy.maintainedDeploymentUpgradeMinimum} maintained upgrades; gate ${summary.gate}.`,
);
