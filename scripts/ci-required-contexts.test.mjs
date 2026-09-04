import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const ruleset = JSON.parse(read(".github/rulesets/main.json"));
const actionContexts = ruleset.rules
  .find(rule => rule.type === "required_status_checks")
  .parameters.required_status_checks.filter(check => check.integration_id === 15368)
  .map(check => check.context)
  .sort();

const requiredJobs = [
  [".github/workflows/ci.yml", "release-impact", "Release impact", "github.event_name == 'pull_request'"],
  [".github/workflows/ci.yml", "build", "TypeScript", "always()"],
  [".github/workflows/ci.yml", "jvm", "JVM", "always()"],
  [".github/workflows/ci.yml", "generated-entity", "Generated full-stack fixture", "always()"],
  [".github/workflows/ci.yml", "generated-frontend", "Generated frontend-only fixture", "always()"],
  [".github/workflows/ci.yml", "project-upgrade", "Public adjacent project-upgrade fixtures", "always()"],
  [".github/workflows/ci.yml", "plan", "plan", "always() && github.event_name == 'pull_request'"],
  [".github/workflows/website.yml", "changes", "Detect standalone website changes", null],
  [".github/workflows/website.yml", "build", "Build standalone website", "always()"],
  [
    ".github/workflows/codeql.yml",
    "analyze",
    "Java and TypeScript analysis",
    "always() && (github.event_name != 'workflow_dispatch' || github.ref == 'refs/heads/main')",
  ],
  [
    ".github/workflows/security.yml",
    "dependency-review",
    "dependency-review",
    "always() && github.event_name == 'pull_request'",
  ],
  [
    ".github/workflows/security.yml",
    "secret-scan",
    "Secret history scan",
    "github.event_name != 'schedule' || github.event.schedule == '7 4 * * 1'",
  ],
];

function jobBlock(workflow, job) {
  const lines = workflow.split("\n");
  const start = lines.indexOf(`  ${job}:`);
  if (start < 0) return "";
  const end = lines.findIndex((line, index) => index > start && /^ {2}[A-Za-z0-9_-]+:$/u.test(line));
  return lines.slice(start, end < 0 ? undefined : end).join("\n");
}

test("each Actions required context has an unconditionally reporting pull-request job", () => {
  assert.deepEqual(requiredJobs.map(([, , context]) => context).sort(), actionContexts);
  for (const [path, job, context, expectedIf] of requiredJobs) {
    const workflow = read(path);
    const header = workflow.slice(0, workflow.indexOf("permissions:"));
    assert.match(header, /^ {2}pull_request:/mu, `${context} must be available to pull requests`);
    assert.doesNotMatch(
      header,
      /^ {2}pull_request:\n(?: {4}[^\n]*\n)*(?: {4}(?:paths|paths-ignore):)/mu,
      `${context} must not use top-level pull-request path filters`,
    );
    const block = jobBlock(workflow, job);
    assert.notEqual(block, "", `${context} job must exist`);
    if (context !== job) {
      assert.match(block, new RegExp(`^    name: ${context.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}$`, "mu"));
    }
    const ifLines = block.split("\n").filter(line => line.startsWith("    if:"));
    assert.deepEqual(
      ifLines,
      expectedIf === null ? [] : [`    if: ${expectedIf}`],
      `${context} must retain its exact pull-request reporting condition`,
    );
  }
});

test("independent GitHub CodeQL integration remains required separately", () => {
  const checks = ruleset.rules.find(rule => rule.type === "required_status_checks").parameters.required_status_checks;
  assert.ok(checks.some(check => check.context === "CodeQL" && check.integration_id === 57789));
  assert.equal(actionContexts.includes("CodeQL"), false);
});

test("required-context bridges propagate only their real policy job result", () => {
  const ci = read(".github/workflows/ci.yml");
  const consumerBridge = jobBlock(ci, "plan");
  assert.match(consumerBridge, /^\x20{4}needs: consumer-gauntlet-policy$/mu);
  assert.match(consumerBridge, /^\x20{10}POLICY_RESULT: \$\{\{ needs\.consumer-gauntlet-policy\.result \}\}$/mu);
  assert.match(consumerBridge, /^\x20{8}run: test "\$POLICY_RESULT" = success$/mu);

  const security = read(".github/workflows/security.yml");
  const dependencyBridge = jobBlock(security, "dependency-review");
  assert.match(dependencyBridge, /^\x20{4}needs: dependency-review-check$/mu);
  assert.match(dependencyBridge, /^\x20{10}REVIEW_RESULT: \$\{\{ needs\.dependency-review-check\.result \}\}$/mu);
  assert.match(dependencyBridge, /^\x20{8}run: test "\$REVIEW_RESULT" = success$/mu);
});

test("the secret scan excludes only the Tuesday dependency schedule", () => {
  const security = read(".github/workflows/security.yml");
  const secretScan = jobBlock(security, "secret-scan");
  assert.match(secretScan, /github\.event_name != 'schedule' \|\| github\.event\.schedule == '7 4 \* \* 1'/u);
  assert.match(security, /- cron: "7 4 \* \* 1"/u);
  assert.match(security, /- cron: "43 3 \* \* 2"/u);
});

test("pull-request planners execute only the base revision or fail closed during bootstrap", () => {
  for (const path of [
    ".github/workflows/ci.yml",
    ".github/workflows/codeql.yml",
    ".github/workflows/security.yml",
    ".github/workflows/website.yml",
  ]) {
    const workflow = read(path);
    assert.match(workflow, /git cat-file -e "\$BASE_SHA:scripts\/ci-change-plan\.mjs"/u, path);
    assert.match(workflow, /git worktree add --detach "\$planner_root" "\$BASE_SHA"/u, path);
    assert.match(
      workflow,
      /git show "\$BASE_SHA:contracts\/ci-change-plan-policy\.json" \| node -e 'const policy=JSON\.parse\(require\("node:fs"\)\.readFileSync\(0,"utf8"\)\); process\.exit\(policy\.schemaVersion===1&&\["publicBetaEvidence","documentationPages"\]\.every\(name=>policy\.scopes\?\.\[name\]\)\?0:1\)'/u,
      path,
    );
    assert.match(workflow, /node "\$planner_root\/scripts\/ci-change-plan\.mjs"/u, path);
    for (const output of ["public-beta-evidence=true", "documentation-pages=true"]) {
      assert.match(workflow, new RegExp(`^\\s*${output}$`, "mu"), `${path} bootstrap must emit ${output}`);
    }
    assert.match(workflow, /reason=base-planner-unavailable; running complete suite/u, path);
  }
});
