import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readiness = JSON.parse(readFileSync(resolve(root, "contracts/public-beta-engineering-readiness.json"), "utf8"));
const aggregate = JSON.parse(readFileSync(resolve(root, "docs/roadmap/phase-5/evidence/aggregate.json"), "utf8"));

assert.equal(readiness.machineClosure.status, "PASS");
assert.equal(readiness.humanGate.status, "HOLD");
assert.deepEqual(readiness.adoptionSnapshot, {
  workflowSessions: aggregate.workflowSessions.total,
  qualifyingActiveTeams: aggregate.adoption.qualifyingActiveTeams,
  maintainedDeploymentUpgrades: aggregate.adoption.maintainedDeploymentUpgrades,
});
assert.match(readiness.humanGate.privacyRule, /sanitized/u);
