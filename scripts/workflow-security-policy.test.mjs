import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { validateReleasePrWorkflow } from "./workflow-security-policy.mjs";

const read = relative => readFileSync(new URL(`../${relative}`, import.meta.url), "utf8");
const actionPolicy = JSON.parse(read("contracts/github-actions-policy.json"));
const releaseWorkflow = read(".github/workflows/release.yml");

test("accepts the narrowly scoped Changesets release-PR workflow", () => {
  assert.deepEqual(validateReleasePrWorkflow(releaseWorkflow, actionPolicy), []);
});

test("rejects release-PR workflow operations outside reviewed version maintenance", () => {
  const withNamedApprovalCommand = releaseWorkflow.replace(
    "      - run: corepack npm ci --ignore-scripts",
    "      - name: Approve the release pull request\n        run: gh pr review --approve 1",
  );
  const withMergeAction = releaseWorkflow.replace(
    "uses: actions/setup-node@",
    "uses: peter-evans/enable-pull-request-automerge@",
  );
  const withPublicationInput = releaseWorkflow.replace(
    "version: corepack npm run version-packages",
    "publish: corepack npm run release:publish-candidates",
  );

  assert.match(
    validateReleasePrWorkflow(withNamedApprovalCommand, actionPolicy).join("\n"),
    /approval, merge, publication, and deployment commands are prohibited/u,
  );
  assert.match(
    validateReleasePrWorkflow(withMergeAction, actionPolicy).join("\n"),
    /may use only checkout, setup-node, and the reviewed Changesets action/u,
  );
  assert.match(
    validateReleasePrWorkflow(withPublicationInput, actionPolicy).join("\n"),
    /must configure Changesets only to version and open the reviewed release PR/u,
  );
});

test("rejects named multiline release-PR commands", () => {
  const withNamedMultilineCommand = releaseWorkflow.replace(
    "      - run: corepack npm ci --ignore-scripts",
    "      - name: Install then approve the release pull request\n        run: |\n          corepack npm ci --ignore-scripts\n          gh pr review --approve 1",
  );

  const problems = validateReleasePrWorkflow(withNamedMultilineCommand, actionPolicy).join("\n");

  assert.match(problems, /may not use multiline run values/u);
  assert.match(problems, /approval, merge, publication, and deployment commands are prohibited/u);
});

test("rejects expanded release-PR triggers and token scopes", () => {
  const withPullRequestTrigger = releaseWorkflow.replace("workflow_dispatch:", "pull_request:");
  const withAdditionalScope = releaseWorkflow.replace("pull-requests: write", "issues: write");

  assert.match(
    validateReleasePrWorkflow(withPullRequestTrigger, actionPolicy).join("\n"),
    /must run only for pushes to main and manual dispatch/u,
  );
  assert.match(
    validateReleasePrWorkflow(withAdditionalScope, actionPolicy).join("\n"),
    /must grant exactly contents\/pull-requests write permissions/u,
  );
});
