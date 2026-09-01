import assert from "node:assert/strict";
import test from "node:test";
import { assertPackableProjectUpgrade } from "./lib/project-upgrade-publication-state.mjs";

const previousCommit = "a".repeat(40);
const targetCommit = "b".repeat(40);

function candidate() {
  return {
    project: {
      publicationState: "candidate",
      publicRelease: "0.8.0",
      candidateRelease: "0.8.1",
      previousRelease: "0.8.0",
      finalization: { targetTemplateCommit: "TEMPLATE_COMMIT_PENDING_RELEASE" },
    },
    policy: {
      schemaVersion: 2,
      releaseGraph: {
        publicRelease: "0.8.0",
        candidateRelease: "0.8.1",
        previousRelease: "0.8.0",
        releases: [
          { release: "0.8.0", status: "current", templateCommit: previousCommit },
          { release: "0.8.1", status: "candidate", templateCommit: "TEMPLATE_COMMIT_PENDING_RELEASE" },
        ],
        edges: [{ from: "0.8.0", to: "0.8.1" }],
      },
    },
  };
}

test("ordinary merge packaging accepts a structurally valid upgrade candidate", () => {
  const state = candidate();
  assert.deepEqual(assertPackableProjectUpgrade(state.project, state.policy), {
    state: "candidate",
    targetRelease: "0.8.1",
  });
});

test("publication packaging rejects an otherwise valid upgrade candidate", () => {
  const state = candidate();
  assert.throws(
    () => assertPackableProjectUpgrade(state.project, state.policy, "publication"),
    /cannot be packed for publication/u,
  );
});

test("ordinary merge packaging accepts a candidate once its distinct Template commit is pinned", () => {
  const state = candidate();
  state.project.finalization.targetTemplateCommit = targetCommit;
  state.policy.releaseGraph.releases[1].templateCommit = targetCommit;
  assert.deepEqual(assertPackableProjectUpgrade(state.project, state.policy), {
    state: "candidate",
    targetRelease: "0.8.1",
  });
});

test("publication packaging accepts only a finalized immutable adjacent release", () => {
  const state = candidate();
  delete state.project.candidateRelease;
  delete state.project.finalization;
  state.project.publicationState = "final";
  state.project.publicRelease = "0.8.1";
  state.policy.releaseGraph.publicRelease = "0.8.1";
  delete state.policy.releaseGraph.candidateRelease;
  state.policy.releaseGraph.releases[0].status = "historical";
  state.policy.releaseGraph.releases[1].status = "current";
  state.policy.releaseGraph.releases[1].templateCommit = targetCommit;
  assert.deepEqual(assertPackableProjectUpgrade(state.project, state.policy, "publication"), {
    state: "final",
    targetRelease: "0.8.1",
  });
});
