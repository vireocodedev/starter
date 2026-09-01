import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { validateNpmReleaseMavenPrerequisite } from "./npm-release-maven-prerequisite-policy.mjs";

const workflow = readFileSync(new URL("../.github/workflows/release-npm.yml", import.meta.url), "utf8");
const prerequisiteName = "Verify current Maven artifacts are public before npm publication";
const prerequisiteRun =
  './jvm/scripts/verify-central-consumer.sh "$(node scripts/current-ecosystem-maven-version.mjs)"';
const prerequisite = `      - name: ${prerequisiteName}\n        run: ${prerequisiteRun}`;

function problems(source) {
  return validateNpmReleaseMavenPrerequisite(source).join("\n");
}

test("npm publication verify stage requires one unconditional current Maven availability proof", () => {
  assert.deepEqual(validateNpmReleaseMavenPrerequisite(workflow), []);
});

test("rejects Maven prerequisite bypasses and structural drift", () => {
  for (const source of [
    workflow.replace(`${prerequisite}\n`, ""),
    workflow.replace(prerequisiteName, "Verify Maven availability"),
    workflow.replace(prerequisite, `${prerequisite}\n        if: false`),
    workflow.replace(prerequisite, `${prerequisite}\n        continue-on-error: true`),
    workflow.replace(prerequisiteRun, `${prerequisiteRun} || true`),
    workflow.replace(prerequisite, `${prerequisite}\n${prerequisite}`),
    workflow.replace("    timeout-minutes: 60", "    timeout-minutes: 60\n    continue-on-error: true"),
  ]) {
    assert.match(
      problems(source),
      /exactly one named Maven public-availability prerequisite|unconditional exact single-line anonymous verification command|may not continue on error at job level/u,
    );
  }
});

test("rejects publication jobs that do not depend exactly on successful verify", () => {
  for (const source of [
    workflow.replace("    needs: verify\n", ""),
    workflow.replace("    needs: verify", "    needs: [verify, another]"),
    workflow.replace("    needs: verify\n", "    needs: verify\n    needs: another\n"),
    workflow.replaceAll("    if: github.ref == 'refs/heads/main'", "    if: always()"),
  ]) {
    assert.match(
      problems(source),
      /must require successful verify|must declare exactly one needs dependency|main-only success-gated publish condition/u,
    );
  }
});
