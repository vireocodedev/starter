import assert from "node:assert/strict";
import test from "node:test";
import {
  assertPackedProjectUpgradeBaselines,
  managedConsumerSkillPaths,
} from "./lib/packed-project-upgrade-baselines.mjs";

function managedSkills() {
  return managedConsumerSkillPaths.map((path, index) => ({
    path,
    operation: "add",
    targetContent: `skill ${index}\n`,
    targetSha256: `${index}`.repeat(64),
  }));
}

function policy({ publicRelease, candidateRelease, previousRelease, baselines }) {
  return {
    releaseGraph: {
      publicRelease,
      ...(candidateRelease ? { candidateRelease } : {}),
      previousRelease,
      releases: [{ release: "0.7.0" }, { release: "0.8.0" }, { release: "0.8.1" }],
      baselines,
    },
  };
}

test("accepts a current edge that introduces the six managed consumer skills", () => {
  const additions = managedSkills();
  assert.deepEqual(
    assertPackedProjectUpgradeBaselines(
      policy({
        publicRelease: "0.8.0",
        previousRelease: "0.7.0",
        baselines: { "0.7.0->0.8.0": { "full-stack": additions, frontend: structuredClone(additions) } },
      }),
    ),
    {
      adjacentEdge: "0.7.0->0.8.0",
      retainedSkillEdge: "0.7.0->0.8.0",
      managedSkillBaselines: additions,
      skillsAddedByCurrentEdge: true,
    },
  );
});

test("retains prior managed skills when the current patch edge has no Template-file baselines", () => {
  const additions = managedSkills();
  const result = assertPackedProjectUpgradeBaselines(
    policy({
      publicRelease: "0.8.1",
      previousRelease: "0.8.0",
      baselines: {
        "0.7.0->0.8.0": { "full-stack": additions, frontend: structuredClone(additions) },
        "0.8.0->0.8.1": { "full-stack": [], frontend: [] },
      },
    }),
  );

  assert.equal(result.adjacentEdge, "0.8.0->0.8.1");
  assert.equal(result.retainedSkillEdge, "0.7.0->0.8.0");
  assert.deepEqual(result.managedSkillBaselines, additions);
  assert.equal(result.skillsAddedByCurrentEdge, false);
});

test("uses a pending candidate as the adjacent packed-upgrade target", () => {
  const additions = managedSkills();
  const result = assertPackedProjectUpgradeBaselines(
    policy({
      publicRelease: "0.8.0",
      candidateRelease: "0.8.1",
      previousRelease: "0.8.0",
      baselines: {
        "0.7.0->0.8.0": { "full-stack": additions, frontend: structuredClone(additions) },
        "0.8.0->0.8.1": { "full-stack": [], frontend: [] },
      },
    }),
  );

  assert.equal(result.adjacentEdge, "0.8.0->0.8.1");
  assert.equal(result.retainedSkillEdge, "0.7.0->0.8.0");
  assert.equal(result.skillsAddedByCurrentEdge, false);
});

test("rejects a partial duplicate skill set on the current edge", () => {
  const additions = managedSkills();
  assert.throws(
    () =>
      assertPackedProjectUpgradeBaselines(
        policy({
          publicRelease: "0.8.1",
          previousRelease: "0.8.0",
          baselines: {
            "0.7.0->0.8.0": { "full-stack": additions, frontend: structuredClone(additions) },
            "0.8.0->0.8.1": { "full-stack": [additions[0]], frontend: [additions[0]] },
          },
        }),
      ),
    /must add the six consumer skills identically/u,
  );
});
