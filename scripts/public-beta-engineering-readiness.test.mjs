import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readiness = JSON.parse(readFileSync(resolve(root, "contracts/public-beta-engineering-readiness.json"), "utf8"));
const aggregate = JSON.parse(readFileSync(resolve(root, "docs/roadmap/phase-5/evidence/aggregate.json"), "utf8"));

assert.equal(readiness.machineClosure.status, "PASS");
assert.equal(readiness.humanGate.status, "HOLD");
assert.ok(readiness.machineClosure.resolved.includes("P1-09-npm-release-continuity"));
assert.ok(
  readiness.machineClosure.evidence.includes("docs/roadmap/phase-1/evidence/npm-release-continuity-2026-09-01.md"),
);
assert.equal(readiness.humanGate.pending.includes("npm-trusted-publisher-release-continuity"), false);
assert.deepEqual(readiness.adoptionSnapshot, {
  workflowSessions: aggregate.workflowSessions.total,
  qualifyingActiveTeams: aggregate.adoption.qualifyingActiveTeams,
  maintainedDeploymentUpgrades: aggregate.adoption.maintainedDeploymentUpgrades,
});
assert.match(readiness.humanGate.privacyRule, /sanitized/u);
