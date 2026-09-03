import assert from "node:assert/strict";
import test from "node:test";
import { assessTemplateAdoption, canonicalReadyAdoption } from "./reconcile-template-adoption.mjs";

const mainSha = "a".repeat(40);
const headSha = "b".repeat(40);
const expected = {
  title: "chore(template): adopt starter-template@1.2.3",
  body: "<!-- vireo-template-adoption:starter-template@1.2.3 -->\n\nThis ready PR pins the immutable public Template release and contains the deterministic create-vireo version, changelog, lockfile, and synchronized release contracts.",
  branch: "automation/template-1.2.3",
  appLogin: "vireo-template-adoption[bot]",
  appEmail: "324462250+vireo-template-adoption[bot]@users.noreply.github.com",
  tree: "c".repeat(40),
  paths: [".changeset/adopt-template-1.2.3.md", "contracts/template-adoption-intent.json"],
  commitMessage: "chore(template): stage 1.2.3 adoption",
};
const required = [{ context: "TypeScript", integration_id: 15368 }];
function valid() {
  return {
    pr: {
      number: 7,
      title: expected.title,
      body: expected.body,
      draft: false,
      base: "main",
      head: expected.branch,
      headSha,
      author: expected.appLogin,
      mergeState: "CLEAN",
    },
    mainSha,
    commits: [
      {
        sha: headSha,
        message: expected.commitMessage,
        author: expected.appLogin,
        email: expected.appEmail,
        committer: expected.appLogin,
        committerEmail: expected.appEmail,
        parent: mainSha,
        tree: expected.tree,
      },
    ],
    paths: [...expected.paths],
    threadsComplete: true,
    threadsResolved: true,
    checks: [{ context: "TypeScript", integration_id: 15368, status: "COMPLETED", conclusion: "SUCCESS" }],
  };
}
test("reconciles only the exact ready App-owned candidate", () => {
  assert.deepEqual(assessTemplateAdoption({ expected, required, snapshot: valid() }), {
    eligible: true,
    action: "merge",
    headSha,
    pullNumber: 7,
  });
});
for (const [name, mutate, action] of [
  ["waits for pending required checks", snapshot => (snapshot.checks[0].status = "IN_PROGRESS"), "wait"],
  [
    "waits when a required check is not uniquely latest",
    snapshot => snapshot.checks.push({ ...snapshot.checks[0] }),
    "wait",
  ],
  ["rejects a wrong App author", snapshot => (snapshot.pr.author = "attacker"), "blocked"],
  ["rejects a wrong Git committer", snapshot => (snapshot.commits[0].committer = "attacker"), "blocked"],
  ["rejects a wrong head", snapshot => (snapshot.pr.head = "automation/other"), "blocked"],
  ["rejects a wrong base", snapshot => (snapshot.pr.base = "release"), "blocked"],
  ["rejects a wrong generated tree", snapshot => (snapshot.commits[0].tree = "d".repeat(40)), "blocked"],
  ["rejects a changed PR body", snapshot => (snapshot.pr.body = "edited"), "blocked"],
  ["waits for unresolved conversations", snapshot => (snapshot.threadsResolved = false), "wait"],
  [
    "rejects multiple commits",
    snapshot => snapshot.commits.push({ ...snapshot.commits[0], sha: "e".repeat(40) }),
    "blocked",
  ],
  ["waits when main moved", snapshot => (snapshot.commits[0].parent = "f".repeat(40)), "wait"],
]) {
  test(name, () => {
    const snapshot = valid();
    mutate(snapshot);
    assert.equal(assessTemplateAdoption({ expected, required, snapshot }).action, action);
  });
}
test("never constructs a reconciliation candidate for upgrade.ready false", () => {
  assert.throws(
    () =>
      canonicalReadyAdoption({
        policy: { adoptionBranchPrefix: "automation/template-", prMarkerPrefix: "vireo-template-adoption" },
        plan: { action: "stage", version: "1.2.3", upgrade: { ready: false } },
      }),
    /deterministic ready/u,
  );
});
