import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readiness = readJson("contracts/public-beta-engineering-readiness.json");
const evidencePolicy = readJson("contracts/public-beta-evidence-policy.json");
const aggregate = readJson(evidencePolicy.aggregatePath);
const problems = [];
const requiredMachine = ["P1-03", "P1-09-machine", "G-108", "G-305-maintainer", "G-308"];
const requiredHuman = [
  "professional-identity-and-trademark-clearance",
  "second-trusted-maintainer-and-independent-approval",
  "independent-security-review",
  "manual-at-branded-browser-physical-device-and-installed-pwa-evidence",
  "low-end-device-and-real-user-field-performance",
  "witnessed-target-environment-recovery",
  "unfamiliar-user-workflow-sessions",
  "qualifying-independent-adopters-and-maintained-upgrade",
];

if (readiness.schemaVersion !== 1) problems.push("readiness schemaVersion must equal 1");
if (!/^\d{4}-\d{2}-\d{2}$/u.test(readiness.reviewedAt ?? "")) problems.push("readiness reviewedAt must use YYYY-MM-DD");
if (readiness.machineClosure?.status !== "PASS") problems.push("machineClosure must be PASS only after every machine blocker is closed");
if (readiness.humanGate?.status !== "HOLD") problems.push("humanGate must remain HOLD until external evidence is recorded");
for (const id of requiredMachine) if (!readiness.machineClosure?.resolved?.includes(id)) problems.push(`machine closure is missing ${id}`);
for (const id of requiredHuman) if (!readiness.humanGate?.pending?.includes(id)) problems.push(`human gate is missing ${id}`);
if (!Array.isArray(readiness.machineClosure?.evidence) || readiness.machineClosure.evidence.length < 5)
  problems.push("machine closure must retain five evidence paths");
for (const path of [...(readiness.machineClosure?.evidence ?? []), readiness.humanGate?.handoff]) {
  if (typeof path !== "string" || !path.startsWith("docs/") || !readFileExists(path)) problems.push(`missing readiness evidence path ${path}`);
}
if (!String(readiness.humanGate?.privacyRule ?? "").toLowerCase().includes("sanitized"))
  problems.push("human gate must preserve a sanitized-evidence privacy rule");
for (const key of ["workflowSessions", "qualifyingActiveTeams", "maintainedDeploymentUpgrades"]) {
  if (readiness.adoptionSnapshot?.[key] !== aggregate[key === "workflowSessions" ? "workflowSessions" : "adoption"]?.[key === "workflowSessions" ? "total" : key])
    problems.push(`adoption snapshot ${key} must match the privacy-safe aggregate`);
}
if (!Array.isArray(readiness.postBetaNonblocking) || readiness.postBetaNonblocking.length < 2)
  problems.push("post-beta nonblocking scope must be explicit");

if (problems.length) {
  console.error("Public-beta engineering readiness failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Public-beta engineering closure PASS; external human gate HOLD (${aggregate.workflowSessions.total} sessions, ${aggregate.adoption.qualifyingActiveTeams}/${evidencePolicy.qualifyingTeamMinimum} teams, ${aggregate.adoption.maintainedDeploymentUpgrades}/${evidencePolicy.maintainedDeploymentUpgradeMinimum} upgrades).`);

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

function readFileExists(path) {
  try {
    readFileSync(join(root, path), "utf8");
    return true;
  } catch {
    return false;
  }
}
