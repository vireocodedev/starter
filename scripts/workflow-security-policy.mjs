import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateNpmReleaseMavenPrerequisite } from "./npm-release-maven-prerequisite-policy.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workflowsRoot = join(repoRoot, ".github", "workflows");
const policy = JSON.parse(readFileSync(join(repoRoot, "contracts", "github-actions-policy.json"), "utf8"));
const problems = [];
const observedActions = new Set();
const observedWriteJobs = new Set();
const observedWorkflowImages = new Set();

function indentation(line) {
  return line.length - line.trimStart().length;
}

function parseJobs(lines) {
  const jobs = [];
  const jobsLine = lines.findIndex(line => line === "jobs:");
  if (jobsLine < 0) return jobs;

  for (let index = jobsLine + 1; index < lines.length; index += 1) {
    const match = lines[index].match(/^ {2}([A-Za-z0-9_-]+):\s*$/);
    if (!match) continue;
    const start = index;
    let end = lines.length;
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      if (/^ {2}[A-Za-z0-9_-]+:\s*$/.test(lines[cursor])) {
        end = cursor;
        break;
      }
      if (/^[A-Za-z0-9_-]+:/.test(lines[cursor])) {
        end = cursor;
        break;
      }
    }
    jobs.push({ name: match[1], start, end });
    index = end - 1;
  }
  return jobs;
}

function jobForLine(jobs, lineNumber) {
  return jobs.find(job => lineNumber >= job.start && lineNumber < job.end);
}

export function parseJobPermissions(lines, job) {
  const permissions = new Map();
  const permissionLine = lines
    .slice(job.start, job.end)
    .findIndex(line => line === "    permissions:" || line === "    permissions: {}");
  if (permissionLine < 0) return null;
  if (lines[job.start + permissionLine] === "    permissions: {}") return permissions;

  const start = job.start + permissionLine + 1;
  for (let index = start; index < job.end; index += 1) {
    const match = lines[index].match(/^ {6}([A-Za-z-]+): (read|write|none)\s*$/);
    if (!match) break;
    permissions.set(match[1], match[2]);
  }
  return permissions;
}

function hasMainOnlyManualDispatchGuard(lines, job) {
  return lines
    .slice(job.start, job.end)
    .some(
      line =>
        /^ {4}if:/.test(line) &&
        /github\.ref == 'refs\/heads\/main'/.test(line) &&
        (/github\.event_name != 'workflow_dispatch'/.test(line) ||
          /^ {4}if: github\.ref == 'refs\/heads\/main'(?:\s*&&|\s*$)/.test(line)),
    );
}

function inspectCheckoutCredentials(fileName, lines, jobs, lineNumber) {
  const job = jobForLine(jobs, lineNumber);
  if (!job) {
    problems.push(`${fileName}:${lineNumber + 1} checkout is outside a job`);
    return;
  }

  const leading = indentation(lines[lineNumber]);
  const stepIndent = lines[lineNumber].trimStart().startsWith("- uses:") ? leading : leading - 2;
  let stepStart = lineNumber;
  while (stepStart > job.start) {
    if (indentation(lines[stepStart]) === stepIndent && lines[stepStart].trimStart().startsWith("- ")) {
      break;
    }
    stepStart -= 1;
  }
  let stepEnd = lineNumber + 1;
  while (stepEnd < job.end) {
    if (indentation(lines[stepEnd]) === stepIndent && lines[stepEnd].trimStart().startsWith("- ")) {
      break;
    }
    stepEnd += 1;
  }

  const key = `${fileName}:${job.name}`;
  const mayPersist = new Set(policy.checkoutCredentialJobs ?? []).has(key);
  const explicitlyDisabled = lines
    .slice(stepStart, stepEnd)
    .some(line => /^\s+persist-credentials: false\s*$/.test(line));
  if (!mayPersist && !explicitlyDisabled) {
    problems.push(`${key} must set checkout persist-credentials: false`);
  }
  if (mayPersist && explicitlyDisabled) {
    problems.push(`${key} is allowed to push but disables checkout credentials`);
  }
}

function mapMatches(actual, expected) {
  return (
    actual instanceof Map &&
    actual.size === expected.size &&
    [...expected].every(([key, value]) => actual.get(key) === value)
  );
}

function actionStep(source, action) {
  const match = source.match(new RegExp(`^([ ]*)(?:- )?uses: ${action}@[^\\s]+(?:\\s+#\\s+[^\\s]+)?\\s*$`, "mu"));
  if (!match || match.index === undefined) return null;
  const usesIndent = match[1];
  const stepIndent = match[0].startsWith(`${usesIndent}- `) ? usesIndent : usesIndent.slice(0, -2);
  const beforeUses = source.slice(0, match.index);
  const stepStart = beforeUses.lastIndexOf(`\n${stepIndent}- `) + 1;
  const afterUses = source.slice(match.index + match[0].length);
  const nextStep = afterUses.search(new RegExp(`^${stepIndent}- (?:name|uses|run):`, "mu"));
  return source.slice(stepStart, nextStep < 0 ? undefined : match.index + match[0].length + nextStep);
}

function releaseRunSteps(lines, job) {
  const commands = [];
  let hasMultilineRun = false;
  for (const line of lines.slice(job.start, job.end)) {
    const match = line.match(/^(?: {6}- | {8})run:\s*(.*)$/u);
    if (!match) continue;
    const command = match[1];
    if (command.length === 0 || /^(?:\||>)[+-]?$/u.test(command)) {
      hasMultilineRun = true;
      continue;
    }
    commands.push(command);
  }
  return { commands, hasMultilineRun };
}

/**
 * PR-writing automation uses the repository-scoped GitHub App from the protected
 * template-adoption environment. Its App-created PR events run normal required
 * checks; the workflow token remains read-only and cannot approve or merge.
 */
export function validateReleasePrWorkflow(source, actionPolicy) {
  const problems = [];
  const lines = source.split(/\r?\n/);
  const jobs = parseJobs(lines);
  const beforeJobs = source.slice(0, source.indexOf("jobs:"));
  const versionJob = jobs.find(job => job.name === "version");

  if (!/^on:\n {2}push:\n {4}branches: \[main\]\n {2}workflow_dispatch:\s*$/mu.test(beforeJobs)) {
    problems.push("release.yml must run only for pushes to main and manual dispatch");
  }
  if (jobs.length !== 1 || !versionJob) {
    problems.push("release.yml must contain only the version job");
    return problems;
  }
  if (!lines.slice(versionJob.start, versionJob.end).includes("    if: github.ref == 'refs/heads/main'")) {
    problems.push("release.yml:version must restrict every trigger to main");
  }
  if (!mapMatches(parseJobPermissions(lines, versionJob), new Map([["contents", "read"]]))) {
    problems.push("release.yml:version must grant only contents: read; the reviewed GitHub App owns PR writes");
  }
  if (!lines.slice(versionJob.start, versionJob.end).includes("    environment: template-adoption")) {
    problems.push("release.yml:version must use the existing protected template-adoption App environment");
  }

  const actionReferences = [...source.matchAll(/^[ ]*(?:- )?uses: ([^\s@]+)@[^\s]+/gmu)].map(match => match[1]).sort();
  const expectedActions = ["actions/checkout", "actions/setup-node", "changesets/action"];
  if (JSON.stringify(actionReferences) !== JSON.stringify(expectedActions)) {
    problems.push("release.yml may use only checkout, setup-node, and the reviewed Changesets action");
  }
  const changesetsAction = actionPolicy.actions?.["changesets/action"];
  const changesetsStep = actionStep(source, "changesets/action");
  if (
    !changesetsAction ||
    !changesetsStep?.includes(`uses: changesets/action@${changesetsAction.sha} # ${changesetsAction.version}`)
  ) {
    problems.push("release.yml must pin the reviewed Changesets action");
  }
  const changesetsWithBlock = changesetsStep?.match(/^ {8}with:\n((?:^ {10}[^\n]+\n?)*)/mu)?.[1] ?? "";
  const changesetsInputs = changesetsWithBlock.match(/^ {10}([A-Za-z][A-Za-z-]*): (.+)$/gmu) ?? [];
  const expectedInputs = [
    "          version: corepack npm run version-packages",
    '          commit: "chore(release): version public ecosystem"',
    '          title: "chore(release): version public ecosystem"',
  ];
  if (
    changesetsInputs.length !== expectedInputs.length ||
    !expectedInputs.every(input => changesetsInputs.includes(input))
  ) {
    problems.push("release.yml must configure Changesets only to version and open the reviewed release PR");
  }

  const { commands: runCommands, hasMultilineRun } = releaseRunSteps(lines, versionJob);
  if (hasMultilineRun) {
    problems.push("release.yml:version may not use multiline run values");
  }
  if (
    runCommands.length !== 3 ||
    runCommands[0] !== "corepack npm ci --ignore-scripts" ||
    runCommands[1] !== "node scripts/prepare-jvm-only-release-trigger.mjs" ||
    runCommands[2] !== "node scripts/create-template-adoption-app-token.mjs"
  ) {
    problems.push(
      "release.yml may execute only the lifecycle-script-free install; approval, merge, publication, and deployment commands are prohibited",
    );
  }
  const versionLines = lines.slice(versionJob.start, versionJob.end).join("\n");
  for (const fragment of [
    "TEMPLATE_ADOPTION_APP_ID: ${{ vars.TEMPLATE_ADOPTION_APP_ID }}",
    "TEMPLATE_ADOPTION_APP_PRIVATE_KEY: ${{ secrets.TEMPLATE_ADOPTION_APP_PRIVATE_KEY }}",
    "GITHUB_TOKEN: ${{ steps.app-token.outputs.token }}",
  ]) {
    if (!versionLines.includes(fragment))
      problems.push(`release.yml:version must retain exact App-token release-PR mutation: ${fragment}`);
  }
  if (/GITHUB_TOKEN:\s*\$\{\{\s*(?:secrets\.GITHUB_TOKEN|github\.token)\s*\}\}/u.test(versionLines))
    problems.push("release.yml:version must not use the workflow token for Changesets PR mutation");

  return problems;
}

export function validateTemplateAdoptionWorkflow(source) {
  const problems = [];
  const lines = source.split(/\r?\n/u);
  const jobs = parseJobs(lines);
  const plan = jobs.find(job => job.name === "plan");
  const stage = jobs.find(job => job.name === "stage");
  const inspect = jobs.find(job => job.name === "inspect-ready");
  const merge = jobs.find(job => job.name === "merge-ready");
  if (
    !/^on:\n {2}schedule:\n(?:[\s\S]*?) {2}workflow_dispatch:\s*$/mu.test(
      source.slice(0, source.indexOf("concurrency:")),
    )
  )
    problems.push("adopt-template-release.yml must use only schedule and workflow_dispatch triggers");
  if (!plan || !stage || !inspect || !merge || jobs.length !== 4)
    problems.push("adopt-template-release.yml must contain exact plan, stage, inspect-ready, and merge-ready jobs");
  if (plan && !mapMatches(parseJobPermissions(lines, plan), new Map([["contents", "read"]])))
    problems.push("adopt-template-release.yml:plan must have only contents: read");
  if (stage && !mapMatches(parseJobPermissions(lines, stage), new Map([["contents", "read"]])))
    problems.push(
      "adopt-template-release.yml:stage must have only contents: read; GitHub App writes are separately scoped",
    );
  if (
    !inspect ||
    !mapMatches(
      parseJobPermissions(lines, inspect),
      new Map([
        ["contents", "read"],
        ["checks", "read"],
        ["pull-requests", "read"],
      ]),
    )
  )
    problems.push("adopt-template-release.yml:inspect-ready must have only contents, checks, and pull-requests read");
  if (
    !merge ||
    !mapMatches(
      parseJobPermissions(lines, merge),
      new Map([
        ["contents", "read"],
        ["checks", "read"],
        ["pull-requests", "read"],
      ]),
    )
  )
    problems.push(
      "adopt-template-release.yml:merge-ready must have only contents, checks, and pull-requests read; the GitHub App owns merge writes",
    );
  const stageLines = stage ? lines.slice(stage.start, stage.end).join("\n") : "";
  const uploadName = "      - name: Upload immutable Template adoption plan";
  const uploadStarts = plan
    ? lines.slice(plan.start, plan.end).flatMap((line, offset) => (line === uploadName ? [plan.start + offset] : []))
    : [];
  if (uploadStarts.length !== 1) {
    problems.push("adopt-template-release.yml:plan artifact upload must contain exactly one named upload step in plan");
  } else {
    const uploadStart = uploadStarts[0];
    let uploadEnd = plan.end;
    for (let index = uploadStart + 1; index < plan.end; index += 1) {
      if (/^ {6}- /u.test(lines[index])) {
        uploadEnd = index;
        break;
      }
    }
    const stepProperties = new Map();
    const withProperties = new Map();
    let inWith = false;
    for (const line of lines.slice(uploadStart + 1, uploadEnd)) {
      if (line.trim() === "") continue;
      const direct = /^ {8}([A-Za-z][A-Za-z-]*):(?:\s*(.*))?$/u.exec(line);
      if (direct) {
        inWith = direct[1] === "with";
        const values = stepProperties.get(direct[1]) ?? [];
        values.push((direct[2] ?? "").trim());
        stepProperties.set(direct[1], values);
        continue;
      }
      if (!inWith) {
        problems.push("adopt-template-release.yml:plan artifact upload has noncanonical step syntax");
        continue;
      }
      const nested = /^ {10}([A-Za-z][A-Za-z-]*):(?:\s*(.*))?$/u.exec(line);
      if (!nested) {
        problems.push("adopt-template-release.yml:plan artifact upload has noncanonical with syntax");
        continue;
      }
      const values = withProperties.get(nested[1]) ?? [];
      values.push((nested[2] ?? "").trim());
      withProperties.set(nested[1], values);
    }
    const expectedStep = new Map([
      ["if", "always()"],
      ["uses", "actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1"],
      ["with", ""],
    ]);
    const expectedWith = new Map([
      ["name", "template-adoption-plan-${{ github.sha }}"],
      ["path", ".template-adoption-plan.json"],
      ["include-hidden-files", "true"],
      ["if-no-files-found", "error"],
      ["retention-days", "90"],
    ]);
    const exactProperties = (actual, expected, location) => {
      if (actual.size !== expected.size || [...actual.keys()].some(key => !expected.has(key)))
        problems.push(`adopt-template-release.yml:plan artifact upload has unexpected ${location} properties`);
      for (const [key, value] of expected) {
        const values = actual.get(key) ?? [];
        if (values.length !== 1 || values[0] !== value)
          problems.push(
            `adopt-template-release.yml:plan artifact upload must retain exact ${location} ${key}: ${value}`,
          );
      }
    };
    exactProperties(stepProperties, expectedStep, "step");
    exactProperties(withProperties, expectedWith, "with");
  }
  for (const fragment of [
    "environment: template-adoption",
    "TEMPLATE_ADOPTION_APP_ID: ${{ vars.TEMPLATE_ADOPTION_APP_ID }}",
    "TEMPLATE_ADOPTION_APP_PRIVATE_KEY: ${{ secrets.TEMPLATE_ADOPTION_APP_PRIVATE_KEY }}",
    "APP_LOGIN: ${{ steps.app-token.outputs.login }}",
    "APP_EMAIL: ${{ steps.app-token.outputs.email }}",
    "Accept only an exact untouched existing adoption pull request",
    "baseRefName,headRefName",
    "baseRefName')\" = main",
    'headRefName\')" = "$branch"',
    "gh pr create",
    "--draft",
    "git write-tree",
    "git reset -- .template-adoption-plan.json",
    "git ls-remote --exit-code --heads origin",
    "reuse_remote=true",
    "git rev-list --count",
    "git show -s --format=%T",
    "git show -s --format='%an <%ae>'",
    '" = "$APP_LOGIN <$APP_EMAIL>"',
    'test "$REUSE_REMOTE" != true',
    'git config user.name "$APP_LOGIN"',
    'git config user.email "$APP_EMAIL"',
    "printf '%s:%s' x-access-token \"$GH_TOKEN\" | base64",
    "::add-mask::$basic_auth",
    'http.extraheader="AUTHORIZATION: Basic $basic_auth"',
  ]) {
    if (!stageLines.includes(fragment)) problems.push(`adopt-template-release.yml:stage must retain ${fragment}`);
  }
  if (/git\s+-c\s+http\.extraheader=.*AUTHORIZATION:\s*bearer/iu.test(stageLines))
    problems.push("adopt-template-release.yml must not use bearer authentication for an App-token Git push");
  if (stageLines.includes("gh pr merge") || stageLines.includes("--auto"))
    problems.push("adopt-template-release.yml may not approve, merge, or auto-merge its draft");
  const inspectLines = inspect ? lines.slice(inspect.start, inspect.end).join("\n") : "";
  const mergeLines = merge ? lines.slice(merge.start, merge.end).join("\n") : "";
  for (const fragment of [
    "Reconstruct the deterministic ready candidate without credentials",
    "node scripts/reconcile-template-adoption.mjs --plan .template-adoption-plan.json --json",
    "GH_TOKEN: ${{ github.token }}",
    "corepack npm run version-packages",
  ])
    if (!inspectLines.includes(fragment))
      problems.push(`adopt-template-release.yml:inspect-ready must retain ${fragment}`);
  if (inspectLines.includes("environment:") || inspectLines.includes("TEMPLATE_ADOPTION_APP_PRIVATE_KEY"))
    problems.push(
      "adopt-template-release.yml:inspect-ready must remain credential-free and outside protected environments",
    );
  for (const fragment of [
    "environment: template-adoption",
    "needs.inspect-ready.outputs.eligible == 'true'",
    "Revalidate eligibility immediately before accessing the App credential",
    "Mint the repository-scoped GitHub App token only for the eligible candidate",
    "TEMPLATE_ADOPTION_APP_ID: ${{ vars.TEMPLATE_ADOPTION_APP_ID }}",
    "TEMPLATE_ADOPTION_APP_PRIVATE_KEY: ${{ secrets.TEMPLATE_ADOPTION_APP_PRIVATE_KEY }}",
    "Revalidate after token mint and perform an expected-head squash merge",
    "READ_GH_TOKEN: ${{ github.token }}",
    "APP_GH_TOKEN: ${{ steps.app-token.outputs.token }}",
    'GH_TOKEN="$READ_GH_TOKEN" node scripts/reconcile-template-adoption.mjs',
    'GH_TOKEN="$APP_GH_TOKEN" gh api --method PUT',
    "gh api --method PUT",
    "merge_method=squash",
    "jq -r '.merged'",
    "EXPECTED_HEAD_SHA",
    "EXPECTED_PULL_NUMBER",
  ])
    if (!mergeLines.includes(fragment)) problems.push(`adopt-template-release.yml:merge-ready must retain ${fragment}`);
  const appTokenStart = mergeLines.indexOf("- id: app-token");
  const preAppLines = appTokenStart < 0 ? "" : mergeLines.slice(0, appTokenStart);
  const appTokenAndMergeLines = appTokenStart < 0 ? mergeLines : mergeLines.slice(appTokenStart);
  if (
    !preAppLines.includes("GH_TOKEN: ${{ github.token }}") ||
    !preAppLines.includes("node scripts/reconcile-template-adoption.mjs")
  )
    problems.push(
      "adopt-template-release.yml:merge-ready must complete full revalidation with github.token before minting the narrow App token",
    );
  if (!appTokenAndMergeLines.includes('GH_TOKEN="$READ_GH_TOKEN" node scripts/reconcile-template-adoption.mjs'))
    problems.push(
      "adopt-template-release.yml:merge-ready must repeat full reconciliation with github.token after minting and immediately before merge",
    );
  if (mergeLines.includes("gh pr merge") || mergeLines.includes("--auto"))
    problems.push(
      "adopt-template-release.yml:merge-ready may use only the expected-head REST merge, never persistent auto-merge",
    );
  return problems;
}

export function validateNpmTemplatePublicationWorkflow(source) {
  const problems = [];
  if (/workflow_dispatch:/u.test(source))
    problems.push("release-npm.yml must not retain routine manual publication dispatch.");
  for (const fragment of [
    "node scripts/ecosystem-publication-plan.mjs",
    "needs.plan.outputs.action == 'libraries-only'",
    "needs.plan.outputs.action == 'jvm-then-libraries'",
    "NPM_PUBLICATION_SCOPE:",
    "classic-libraries",
    "template-adoption",
    "environment: maven-central",
    './scripts/wait-central-validation.sh "$DEPLOYMENT_ID" VALIDATED',
    './scripts/publish-central-deployment.sh "$DEPLOYMENT_ID" "$VERSION"',
    "node scripts/finalize-jvm-release.mjs",
  ]) {
    if (!source.includes(fragment)) problems.push(`release-npm.yml must retain ${fragment}`);
  }
  if (!source.includes("needs: [plan, maven, finalize-jvm]"))
    problems.push("release-npm.yml npm verification must wait for Maven publication in mixed releases.");
  if (
    !source.includes(
      "needs.plan.outputs.action == 'jvm-then-libraries' && needs.maven.result == 'success' && needs.finalize-jvm.result == 'success'",
    ) ||
    !source.includes(
      "needs.plan.outputs.action == 'libraries-only' && needs.maven.result == 'skipped' && needs.finalize-jvm.result == 'skipped'",
    )
  )
    problems.push(
      "release-npm.yml must require successful Maven/finalization for mixed releases and skipped jobs for npm-only releases.",
    );
  return problems;
}

export function validateAlwaysReportedPullRequestWorkflow(source, fileName) {
  const problems = [];
  const beforePermissions = source.slice(0, source.indexOf("permissions:"));
  if (!/^on:\n {2}pull_request:\s*\n {2}[A-Za-z_-]+:/mu.test(beforePermissions)) {
    problems.push(`${fileName} must run for every pull request without paths or paths-ignore filters`);
  }
  const lines = source.split(/\r?\n/u);
  const plan = parseJobs(lines).find(job => job.name === "plan");
  if (!plan || !lines.slice(plan.start, plan.end).includes("    if: always() && github.event_name == 'pull_request'")) {
    problems.push(`${fileName}:plan must exist and report unconditionally for every pull request`);
  }
  return problems;
}

export function validatePostPublicationActivityGate(source, fileName) {
  const problems = [];
  if (!source.includes("node scripts/release-workflow-activity.mjs"))
    problems.push(`${fileName} must classify combined release activity through the authoritative parent jobs API.`);
  if (!source.includes("actions: read"))
    problems.push(`${fileName} activity classification must have only the Actions read capability it needs.`);
  if (fileName === "anonymous-consumer-gauntlet.yml") {
    if (!source.includes("always() && github.event_name == 'workflow_run'"))
      problems.push(
        "anonymous-consumer-gauntlet.yml activity gate must not block manual or scheduled runs after a skipped gate.",
      );
    if (
      !/trusted-source:\n(?:\s+name: [^\n]+\n)?\s+needs: release-activity\n\s+if: >-\n\s+always\(\) && github\.event_name != 'pull_request'/u.test(
        source,
      )
    )
      problems.push(
        "anonymous-consumer-gauntlet.yml trusted source must run manual and scheduled requests after skipped activity classification.",
      );
    if (!source.includes("needs.release-activity.outputs.any-activity == 'true'"))
      problems.push("anonymous-consumer-gauntlet.yml must require exact npm or JVM parent release activity.");
  }
  if (fileName === "verify-npm-public.yml" && !source.includes("needs.activity.outputs.npm-active == 'true'"))
    problems.push("verify-npm-public.yml must run after combined publication only when exact npm activity succeeded.");
  if (fileName === "attest-public-release.yml" && !source.includes("needs.activity.outputs.any-activity == 'true'"))
    problems.push(
      "attest-public-release.yml must run after the combined workflow only when exact npm or JVM activity succeeded.",
    );
  return problems;
}

export function validateWebsiteDeploymentWorkflow(source) {
  const problems = [];
  for (const fragment of [
    "name: Deploy verified website artifact",
    "environment: website-deployment",
    "actions/download-artifact@",
    "site/build-deployment-bundle.mjs",
    "StrictHostKeyChecking=yes",
    "VIREO_WEBSITE_DEPLOY_SSH_PRIVATE_KEY",
    "github.event_name == 'workflow_dispatch'",
    "Require the build commit is still main before activation",
    "stage $GITHUB_RUN_ID",
    "activate $GITHUB_RUN_ID",
    "accept $GITHUB_RUN_ID",
    "rollback $GITHUB_RUN_ID",
    "/.well-known/vireo-deployment.json",
    "IdentitiesOnly=yes",
    "github.event_name == 'schedule'",
    "Reconcile interrupted website deployment",
    'test "$PUBLIC_URL" = "https://vireocode.com"',
    "cancel-in-progress: false",
  ])
    if (!source.includes(fragment))
      problems.push(`website.yml must retain artifact-bound forced-command deployment: ${fragment}`);
  if (/ssh[^\n]*(?:mkdir|tar -x|ln -s|bash|sh -c)/u.test(source))
    problems.push("website.yml must not execute unrestricted remote shell commands");
  return problems;
}

const workflowFiles = readdirSync(workflowsRoot)
  .filter(file => /\.ya?ml$/.test(file))
  .sort();

for (const fileName of workflowFiles) {
  const source = readFileSync(join(workflowsRoot, fileName), "utf8");
  const lines = source.split(/\r?\n/);
  const jobs = parseJobs(lines);

  if (fileName === "release.yml") problems.push(...validateReleasePrWorkflow(source, policy));
  if (fileName === "website.yml") problems.push(...validateWebsiteDeploymentWorkflow(source));
  if (fileName === "adopt-template-release.yml") problems.push(...validateTemplateAdoptionWorkflow(source));
  if (fileName === "release-npm.yml")
    problems.push(...validateNpmReleaseMavenPrerequisite(source), ...validateNpmTemplatePublicationWorkflow(source));
  if (fileName === "release-npm.yml" && !source.includes("GITHUB_TOKEN: ${{ github.token }}"))
    problems.push(
      "release-npm.yml:plan must pass github.token explicitly for bounded release-workflow evidence lookup",
    );
  if (fileName === "anonymous-consumer-gauntlet.yml") {
    if (!source.includes('workflows: ["Release · Publish npm and Maven"]'))
      problems.push("anonymous-consumer-gauntlet.yml must follow the combined ecosystem publication workflow.");
  }
  if (["anonymous-consumer-gauntlet.yml", "verify-npm-public.yml", "attest-public-release.yml"].includes(fileName))
    problems.push(...validatePostPublicationActivityGate(source, fileName));

  if (source.includes("pull_request_target:")) {
    problems.push(`${fileName} may not use pull_request_target`);
  }
  if (!lines.includes("permissions: {}")) {
    problems.push(`${fileName} must deny permissions at workflow level with permissions: {}`);
  }
  const requiredConcurrency = policy.requiredConcurrencyWorkflows?.[fileName];
  if (requiredConcurrency) {
    const expected = [
      "concurrency:",
      `  group: ${requiredConcurrency.group}`,
      `  cancel-in-progress: ${requiredConcurrency.cancelInProgress}`,
    ];
    if (!expected.every(line => lines.includes(line))) {
      problems.push(`${fileName} must declare the required cancellable concurrency group`);
    }
  }
  if (source.includes("ubuntu-latest")) {
    problems.push(`${fileName} may not use floating ubuntu-latest runners`);
  }
  for (const [lineNumber, line] of lines.entries()) {
    if (/^\s+runs-on: ubuntu-/.test(line) && line.trim() !== "runs-on: ubuntu-24.04") {
      problems.push(`${fileName}:${lineNumber + 1} must use the canonical ubuntu-24.04 runner`);
    }
    if (/^\s+node-version:/.test(line) && line.trim() !== "node-version: 24.18.1") {
      problems.push(`${fileName}:${lineNumber + 1} must pin Node 24.18.1`);
    }
    if (/^\s+run: npm(?:\s|$)/.test(line)) {
      problems.push(`${fileName}:${lineNumber + 1} must invoke the declared npm through Corepack`);
    }
    const imageMatch = line.match(/^\s+image:\s+([^\s]+)\s*$/);
    if (imageMatch) {
      const reference = imageMatch[1];
      const approved = Object.entries(policy.workflowContainerImages ?? {}).find(
        ([image, expected]) => reference === `${image}:${expected.version}@${expected.digest}`,
      );
      if (!approved) problems.push(`${fileName}:${lineNumber + 1} uses an unapproved or unpinned job container`);
      else observedWorkflowImages.add(approved[0]);
    }
  }

  for (let lineNumber = 0; lineNumber < lines.length; lineNumber += 1) {
    const match = lines[lineNumber].match(/\buses:\s+([^\s@]+)@([^\s#]+)(?:\s+#\s+([^\s]+))?/);
    if (!match || match[1].startsWith("./")) continue;

    const [, action, reference, versionComment] = match;
    const expected = policy.actions?.[action];
    observedActions.add(action);
    if (!expected) {
      problems.push(`${fileName}:${lineNumber + 1} uses unapproved action ${action}`);
      continue;
    }
    if (!/^[0-9a-f]{40}$/.test(reference)) {
      problems.push(`${fileName}:${lineNumber + 1} must pin ${action} to a full commit SHA`);
    } else if (reference !== expected.sha) {
      problems.push(`${fileName}:${lineNumber + 1} ${action} does not match its approved SHA`);
    }
    if (versionComment !== expected.version) {
      problems.push(`${fileName}:${lineNumber + 1} ${action} must retain version comment ${expected.version}`);
    }
    if (action === "actions/checkout") {
      inspectCheckoutCredentials(fileName, lines, jobs, lineNumber);
    }
    if (action === "actions/setup-node") {
      const job = jobForLine(jobs, lineNumber);
      if (!job) {
        problems.push(`${fileName}:${lineNumber + 1} setup-node is outside a job`);
      } else if (lines.slice(job.start, lineNumber).some(candidate => candidate.includes("actions/checkout@"))) {
        problems.push(
          `${fileName}:${job.name} must run setup-node before checkout so the runner's bundled npm does not evaluate the strict devEngines policy`,
        );
      }
    }
  }

  for (const job of jobs) {
    if (!lines.slice(job.start, job.end).some(line => /^ {4}timeout-minutes: \d+\s*$/.test(line))) {
      problems.push(`${fileName}:${job.name} must declare timeout-minutes`);
    }

    const permissions = parseJobPermissions(lines, job);
    if (!permissions) {
      problems.push(`${fileName}:${job.name} must declare explicit job permissions`);
      continue;
    }
    const writes = [...permissions]
      .filter(([, access]) => access === "write")
      .map(([scope]) => scope)
      .sort();
    if (writes.length === 0) continue;

    const key = `${fileName}:${job.name}`;
    observedWriteJobs.add(key);
    const expectedWrites = [...(policy.writePermissionJobs?.[key] ?? [])].sort();
    if (JSON.stringify(writes) !== JSON.stringify(expectedWrites)) {
      problems.push(`${key} has write permissions [${writes.join(", ")}], expected [${expectedWrites.join(", ")}]`);
    }
    if (
      /^ {2}pull_request:/m.test(source.slice(0, source.indexOf("jobs:"))) &&
      !(policy.pullRequestWriteJobs ?? []).includes(key)
    ) {
      problems.push(`${key} has write access in a pull-request-triggered workflow`);
    }
    if (/^ {2}workflow_dispatch:/m.test(source.slice(0, source.indexOf("jobs:"))) && writes.length > 0) {
      if (!(policy.mainOnlyManualWriteJobs ?? []).includes(key)) {
        problems.push(`${key} must be approved for main-only workflow_dispatch write access`);
      }
      if (!hasMainOnlyManualDispatchGuard(lines, job)) {
        problems.push(`${key} must restrict workflow_dispatch write access to refs/heads/main`);
      }
    }
  }
}

for (const action of Object.keys(policy.actions ?? {})) {
  if (!observedActions.has(action)) problems.push(`Action policy contains unused entry ${action}`);
}
for (const key of Object.keys(policy.writePermissionJobs ?? {})) {
  if (!observedWriteJobs.has(key)) problems.push(`Write-permission policy contains unused entry ${key}`);
}
for (const key of policy.pullRequestWriteJobs ?? []) {
  if (!observedWriteJobs.has(key)) problems.push(`Pull-request write policy contains unused entry ${key}`);
}
for (const key of policy.mainOnlyManualWriteJobs ?? []) {
  if (!observedWriteJobs.has(key)) problems.push(`Manual write policy contains unused entry ${key}`);
}
for (const image of Object.keys(policy.workflowContainerImages ?? {})) {
  if (!observedWorkflowImages.has(image)) problems.push(`Workflow image policy contains unused entry ${image}`);
}

const secretScan = readFileSync(join(repoRoot, "scripts", "secret-scan.sh"), "utf8");
for (const [image, expected] of Object.entries(policy.containerImages ?? {})) {
  const pinnedReference = `${image}@${expected.digest}`;
  if (!secretScan.includes(pinnedReference)) {
    problems.push(`Secret scanner must pin ${image} ${expected.version} to ${expected.digest}`);
  }
}

if (policy.schemaVersion !== 1) {
  problems.push(`Unsupported GitHub Actions policy schema version ${policy.schemaVersion}`);
}

if (problems.length > 0) {
  console.error("Workflow security policy failed:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `Workflow security policy passed: ${workflowFiles.length} workflows, ${observedActions.size} pinned actions, ${observedWriteJobs.size} privileged jobs.`,
);
