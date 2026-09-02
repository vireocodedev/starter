import assert from "node:assert/strict";
import test from "node:test";
import { validateFinalAnonymousEvidence } from "./anonymous-consumer-final-evidence.mjs";
test("final evidence rejects incomplete successful claims", () => {
  const release = { id: "npm-1.2.3_jvm-4.5.6", template: { commit: "a".repeat(40) } };
  const evidence = {
    status: "passed",
    verifierSourceCommit: "b".repeat(40),
    releaseTagCommit: "e".repeat(40),
    requestedReleaseId: release.id,
    workflow: { run: 1 },
    release,
    scenarios: [
      {
        id: "x",
        commands: [
          {
            id: "y",
            status: "passed",
            stdout: { bytes: 0, sha256: "c".repeat(64) },
            stderr: { bytes: 0, sha256: "d".repeat(64) },
          },
        ],
      },
    ],
    externalWarnings: [],
  };
  assert.deepEqual(validateFinalAnonymousEvidence(evidence, release), []);
  evidence.scenarios[0].commands[0].status = "planned";
  assert.match(validateFinalAnonymousEvidence(evidence, release).join("\n"), /not passed/u);
});

test("final evidence requires every policy recipe and nonempty passed operation set", () => {
  const release = { id: "npm-1.2.3_jvm-4.5.6", template: { commit: "a".repeat(40) } };
  const policy = {
    requiredScenarios: ["public-artifacts"],
    scenarios: [{ id: "public-artifacts", recipe: ["exact"] }],
  };
  const evidence = {
    status: "passed",
    verifierSourceCommit: "b".repeat(40),
    releaseTagCommit: "c".repeat(40),
    requestedReleaseId: release.id,
    workflow: { run: "1" },
    release,
    findings: [],
    externalWarnings: [],
    scenarios: [{ id: "public-artifacts", recipe: ["wrong"], status: "passed", commands: [] }],
  };
  const problems = validateFinalAnonymousEvidence(evidence, release, policy).join("\n");
  assert.match(problems, /recipe does not match/u);
  assert.match(problems, /has no operations/u);
  evidence.scenarios[0].recipe = ["exact"];
  evidence.scenarios[0].commands.push({
    id: "operation",
    status: "passed",
    stdout: { bytes: -1, sha256: "d".repeat(64) },
    stderr: { bytes: 0, sha256: "e".repeat(64) },
  });
  assert.match(validateFinalAnonymousEvidence(evidence, release, policy).join("\n"), /valid digest/u);
});
