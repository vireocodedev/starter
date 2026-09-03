import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  parseJobPermissions,
  validateAlwaysReportedPullRequestWorkflow,
  validateReleasePrWorkflow,
  validateNpmTemplatePublicationWorkflow,
  validatePostPublicationActivityGate,
  validateTemplateAdoptionWorkflow,
} from "./workflow-security-policy.mjs";

const read = relative => readFileSync(new URL(`../${relative}`, import.meta.url), "utf8");
const actionPolicy = JSON.parse(read("contracts/github-actions-policy.json"));
const releaseWorkflow = read(".github/workflows/release.yml");
const anonymousGauntletWorkflow = read(".github/workflows/anonymous-consumer-gauntlet.yml");
const websiteWorkflow = read(".github/workflows/website.yml");
const templateAdoptionWorkflow = read(".github/workflows/adopt-template-release.yml");
const npmReleaseWorkflow = read(".github/workflows/release-npm.yml");
const npmVerificationWorkflow = read(".github/workflows/verify-npm-public.yml");
const attestationWorkflow = read(".github/workflows/attest-public-release.yml");

function indentation(line) {
  return /^\s*/u.exec(line)?.[0].length ?? 0;
}

function namedWorkflowStep(workflow, name) {
  const lines = workflow.split("\n");
  const start = lines.indexOf(`      - name: ${name}`);
  if (start < 0) return undefined;
  let end = start + 1;
  while (end < lines.length && !/^ {6}- /u.test(lines[end])) end += 1;
  return lines.slice(start, end);
}

function indentedSubsection(lines, key, indent) {
  const start = lines.indexOf(`${" ".repeat(indent)}${key}:`);
  if (start < 0) return undefined;
  let end = start + 1;
  while (end < lines.length && (lines[end].trim() === "" || indentation(lines[end]) > indent)) end += 1;
  return lines.slice(start + 1, end);
}

function standaloneWebsiteArtifactRetainsHiddenFiles(workflow) {
  const uploadStep = namedWorkflowStep(workflow, "Upload standalone artifact");
  if (
    !uploadStep ||
    !uploadStep.some(line => /^ {8}uses: actions\/upload-artifact@[a-f0-9]{40}(?:\s+#.*)?$/u.test(line))
  )
    return false;
  const withBlock = indentedSubsection(uploadStep, "with", 8);
  return (
    withBlock?.includes("          path: site/dist") === true &&
    withBlock.includes("          include-hidden-files: true")
  );
}

test("accepts the narrowly scoped Changesets release-PR workflow", () => {
  assert.deepEqual(validateReleasePrWorkflow(releaseWorkflow, actionPolicy), []);
});

test("requires the existing repository-scoped App token for Changesets PR mutation", () => {
  assert.match(
    validateReleasePrWorkflow(
      releaseWorkflow.replace(
        "GITHUB_TOKEN: ${{ steps.app-token.outputs.token }}",
        "GITHUB_TOKEN: ${{ github.token }}",
      ),
      actionPolicy,
    ).join("\n"),
    /must not use the workflow token|exact App-token/u,
  );
  assert.match(
    validateReleasePrWorkflow(
      releaseWorkflow.replace("environment: template-adoption", "environment: package-release"),
      actionPolicy,
    ).join("\n"),
    /protected template-adoption App environment/u,
  );
});

test("requires Basic x-access-token authentication for the App-token Git push", () => {
  assert.deepEqual(validateTemplateAdoptionWorkflow(templateAdoptionWorkflow), []);
  const bearer = templateAdoptionWorkflow.replace(
    'http.extraheader="AUTHORIZATION: Basic $basic_auth"',
    'http.extraheader="AUTHORIZATION: bearer $GH_TOKEN"',
  );
  assert.match(validateTemplateAdoptionWorkflow(bearer).join("\n"), /must not use bearer authentication/u);
});

test("retains the hidden immutable Template plan artifact even when planning fails", () => {
  assert.deepEqual(validateTemplateAdoptionWorkflow(templateAdoptionWorkflow), []);
  for (const [before, after] of [
    ["if: always()", "if: success()"],
    ["include-hidden-files: true", "include-hidden-files: false"],
    ["if-no-files-found: error", "if-no-files-found: warn"],
    ["path: .template-adoption-plan.json", "path: plan.json"],
    ["path: .template-adoption-plan.json", "path: .template-adoption-plan.json*"],
  ]) {
    assert.match(
      validateTemplateAdoptionWorkflow(templateAdoptionWorkflow.replace(before, after)).join("\n"),
      /plan artifact upload/u,
      before,
    );
  }
  const uploadName = "      - name: Upload immutable Template adoption plan";
  for (const mutated of [
    templateAdoptionWorkflow.replace(uploadName, "      # Upload immutable Template adoption plan"),
    templateAdoptionWorkflow
      .replace(uploadName, "      # Upload immutable Template adoption plan")
      .replace("  stage:\n", `  stage:\n${uploadName}\n`),
    templateAdoptionWorkflow.replace(uploadName, `${uploadName}\n${uploadName}`),
    templateAdoptionWorkflow.replace("include-hidden-files: true", "# include-hidden-files: true"),
    templateAdoptionWorkflow.replace(
      "          path: .template-adoption-plan.json",
      "          path: .template-adoption-plan.json\n          path: .template-adoption-plan.json",
    ),
    templateAdoptionWorkflow.replace(
      "          path: .template-adoption-plan.json",
      "          path: .template-adoption-plan.json\n          'path': '**'",
    ),
    templateAdoptionWorkflow.replace(
      "          path: .template-adoption-plan.json",
      "          path: .template-adoption-plan.json\n          path : '**'",
    ),
  ]) {
    assert.match(validateTemplateAdoptionWorkflow(mutated).join("\n"), /plan artifact upload/u);
  }
});

test("requires runtime-bound GitHub App bot authorship", () => {
  const hardcodedIdentity = templateAdoptionWorkflow
    .replace('git config user.name "$APP_LOGIN"', 'git config user.name "fixed[bot]"')
    .replace('git config user.email "$APP_EMAIL"', 'git config user.email "1+fixed[bot]@users.noreply.github.com"');
  assert.match(validateTemplateAdoptionWorkflow(hardcodedIdentity).join("\n"), /APP_LOGIN|APP_EMAIL/u);
});

test("constrains automatic ecosystem and immutable Template publication without a manual bypass", () => {
  assert.deepEqual(validateNpmTemplatePublicationWorkflow(npmReleaseWorkflow), []);
  assert.match(
    validateNpmTemplatePublicationWorkflow(
      npmReleaseWorkflow.replaceAll("NPM_PUBLICATION_SCOPE:", "REMOVED_PUBLICATION_SCOPE:"),
    ).join("\n"),
    /NPM_PUBLICATION_SCOPE/u,
  );
});

test("blocks mixed npm publication when Maven or finalization is not successful", () => {
  const weakened = npmReleaseWorkflow.replace(
    "needs.plan.outputs.action == 'jvm-then-libraries' && needs.maven.result == 'success' && needs.finalize-jvm.result == 'success'",
    "needs.plan.outputs.action == 'jvm-then-libraries' && (needs.maven.result == 'success' || needs.maven.result == 'skipped') && (needs.finalize-jvm.result == 'success' || needs.finalize-jvm.result == 'skipped')",
  );
  assert.match(
    validateNpmTemplatePublicationWorkflow(weakened).join("\n"),
    /must require successful Maven\/finalization/u,
  );
});

test("recognizes an explicit empty inline job permissions map", () => {
  const lines = ["  token-free:", "    permissions: {}", "    runs-on: ubuntu-24.04"];
  assert.deepEqual([...parseJobPermissions(lines, { start: 0, end: lines.length })], []);
});

test("standalone website artifacts retain generated hidden files", () => {
  assert.equal(standaloneWebsiteArtifactRetainsHiddenFiles(websiteWorkflow), true);
  assert.equal(
    standaloneWebsiteArtifactRetainsHiddenFiles(
      websiteWorkflow.replace("include-hidden-files: true", "include-hidden-files: false"),
    ),
    false,
  );
  assert.equal(
    standaloneWebsiteArtifactRetainsHiddenFiles(websiteWorkflow.replace("          include-hidden-files: true\n", "")),
    false,
  );
  assert.equal(
    standaloneWebsiteArtifactRetainsHiddenFiles(
      websiteWorkflow.replace(
        "        with:\n          name: vireo-website-${{ github.sha }}\n          path: site/dist\n          include-hidden-files: true",
        "        env:\n          include-hidden-files: true\n        with:\n          name: vireo-website-${{ github.sha }}\n          path: site/dist",
      ),
    ),
    false,
  );
  assert.equal(
    standaloneWebsiteArtifactRetainsHiddenFiles(
      websiteWorkflow.replace("          path: site/dist", "          path: site/build"),
    ),
    false,
  );
  assert.equal(
    standaloneWebsiteArtifactRetainsHiddenFiles(
      websiteWorkflow.replace("uses: actions/upload-artifact@", "uses: actions/download-artifact@"),
    ),
    false,
  );
});

test("requires the protected gauntlet plan to report on every pull request", () => {
  assert.deepEqual(
    validateAlwaysReportedPullRequestWorkflow(anonymousGauntletWorkflow, "anonymous-consumer-gauntlet.yml"),
    [],
  );
  const pathFiltered = anonymousGauntletWorkflow.replace(
    "  pull_request:\n",
    "  pull_request:\n    paths: [package.json]\n",
  );
  assert.match(
    validateAlwaysReportedPullRequestWorkflow(pathFiltered, "anonymous-consumer-gauntlet.yml").join("\n"),
    /must run for every pull request without paths or paths-ignore filters/u,
  );
  const missingPlan = anonymousGauntletWorkflow.replace("  plan:\n", "  disabled-plan:\n");
  assert.match(
    validateAlwaysReportedPullRequestWorkflow(missingPlan, "anonymous-consumer-gauntlet.yml").join("\n"),
    /plan must exist and report unconditionally for every pull request/u,
  );
  const conditionalPlan = anonymousGauntletWorkflow.replace(
    "    if: github.event_name == 'pull_request'",
    "    if: github.event_name == 'pull_request' && github.actor != 'dependabot[bot]'",
  );
  assert.match(
    validateAlwaysReportedPullRequestWorkflow(conditionalPlan, "anonymous-consumer-gauntlet.yml").join("\n"),
    /plan must exist and report unconditionally for every pull request/u,
  );
});

test("binds post-publication gauntlet runs to the combined ecosystem workflow", () => {
  const renamed = anonymousGauntletWorkflow.replace(
    'workflows: ["Publish Vireo ecosystem"]',
    'workflows: ["Publish npm release"]',
  );
  const previous = read(".github/workflows/anonymous-consumer-gauntlet.yml");
  assert.match(previous, /workflows: \["Publish Vireo ecosystem"\]/u);
  assert.doesNotMatch(renamed, /workflows: \["Publish Vireo ecosystem"\]/u);
});

test("fails closed unless downstream workflow_run consumers inspect exact parent release activity", () => {
  assert.deepEqual(
    validatePostPublicationActivityGate(anonymousGauntletWorkflow, "anonymous-consumer-gauntlet.yml"),
    [],
  );
  assert.deepEqual(validatePostPublicationActivityGate(npmVerificationWorkflow, "verify-npm-public.yml"), []);
  assert.deepEqual(validatePostPublicationActivityGate(attestationWorkflow, "attest-public-release.yml"), []);
  assert.match(
    validatePostPublicationActivityGate(
      anonymousGauntletWorkflow.replace(
        "always() && github.event_name == 'workflow_run'",
        "github.event_name == 'workflow_run'",
      ),
      "anonymous-consumer-gauntlet.yml",
    ).join("\n"),
    /manual or scheduled/u,
  );
  assert.match(
    validatePostPublicationActivityGate(
      anonymousGauntletWorkflow.replace(
        "always() && github.event_name != 'pull_request'",
        "github.event_name != 'pull_request'",
      ),
      "anonymous-consumer-gauntlet.yml",
    ).join("\n"),
    /trusted source must run manual and scheduled/u,
  );
  assert.match(
    validatePostPublicationActivityGate(
      npmVerificationWorkflow.replace("needs.activity.outputs.npm-active == 'true'", "true"),
      "verify-npm-public.yml",
    ).join("\n"),
    /exact npm activity/u,
  );
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
  const withAdditionalScope = releaseWorkflow.replace(
    "      contents: read",
    "      contents: write\n      issues: write",
  );

  assert.match(
    validateReleasePrWorkflow(withPullRequestTrigger, actionPolicy).join("\n"),
    /must run only for pushes to main and manual dispatch/u,
  );
  assert.match(
    validateReleasePrWorkflow(withAdditionalScope, actionPolicy).join("\n"),
    /must grant only contents: read/u,
  );
});
