import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = path => JSON.parse(readFileSync(join(root, path), "utf8"));
const readText = path => readFileSync(join(root, path), "utf8");
const problems = [];

function requireExactSet(actual, expected, label) {
  if (
    !Array.isArray(actual) ||
    new Set(actual).size !== actual.length ||
    actual.length !== expected.length ||
    [...actual].sort().join("\n") !== [...expected].sort().join("\n")
  )
    problems.push(`${label} must contain exactly ${expected.join(", ")}`);
}

function validateMainRuleset(ruleset, checks) {
  if (ruleset.name !== "Protect main" || ruleset.target !== "branch" || ruleset.enforcement !== "active")
    problems.push("main ruleset must be active and target only the main branch");
  if (!Array.isArray(ruleset.bypass_actors) || ruleset.bypass_actors.length !== 0)
    problems.push("main ruleset must not grant bypass actors");
  const ref = ruleset.conditions?.ref_name;
  if (ref?.include?.length !== 1 || ref.include[0] !== "refs/heads/main" || ref?.exclude?.length !== 0)
    problems.push("main ruleset must include exactly refs/heads/main");
  const pullRequest = ruleset.rules?.find(rule => rule.type === "pull_request")?.parameters;
  if (
    !pullRequest ||
    pullRequest.dismiss_stale_reviews_on_push !== true ||
    pullRequest.require_code_owner_review !== false ||
    pullRequest.require_last_push_approval !== false ||
    pullRequest.required_approving_review_count !== 0 ||
    pullRequest.required_review_thread_resolution !== true
  )
    problems.push("main ruleset must retain the interim single-maintainer pull-request controls");
  const statusChecks = ruleset.rules?.find(rule => rule.type === "required_status_checks")?.parameters;
  if (
    !statusChecks ||
    statusChecks.strict_required_status_checks_policy !== true ||
    statusChecks.do_not_enforce_on_create !== false
  )
    problems.push("main ruleset must require strict status checks");
  requireExactSet(
    statusChecks?.required_status_checks?.map(check => `${check.context}:${check.integration_id}`) ?? [],
    checks,
    "main ruleset required status checks",
  );
  requireExactSet(
    ruleset.rules?.map(rule => rule.type) ?? [],
    ["deletion", "non_fast_forward", "pull_request", "required_status_checks"],
    "main ruleset rules",
  );
}

function validateTagRuleset(ruleset) {
  if (ruleset.name !== "Protect published release tags" || ruleset.target !== "tag" || ruleset.enforcement !== "active")
    problems.push("release-tag ruleset must be active and target tags");
  if (!Array.isArray(ruleset.bypass_actors) || ruleset.bypass_actors.length !== 0)
    problems.push("release-tag ruleset must not grant bypass actors");
  const ref = ruleset.conditions?.ref_name;
  if (ref?.include?.length !== 1 || ref.include[0] !== "refs/tags/**" || ref?.exclude?.length !== 0)
    problems.push("release-tag ruleset must include exactly refs/tags/**");
  requireExactSet(ruleset.rules?.map(rule => rule.type) ?? [], ["update", "deletion"], "release-tag ruleset rules");
}

function validateActions(actions, selectedActions, patterns) {
  if (actions.enabled !== true || actions.allowed_actions !== "selected" || actions.sha_pinning_required !== true)
    problems.push("Actions permissions payload must enable selected actions with SHA pinning");
  if (selectedActions.github_owned_allowed !== true || selectedActions.verified_allowed !== false)
    problems.push("selected Actions payload must allow GitHub-owned actions and reject verified creators by default");
  requireExactSet(selectedActions.patterns_allowed, patterns, "Actions allowlist patterns");
}

function validateEnvironment(path, { reviewers, policies }) {
  const environment = readJson(path);
  const deploymentPolicies = readJson(path.replace(/\.json$/u, ".deployment-branch-policies.json"));
  const liveAssertions = readJson(path.replace(/\.json$/u, ".live-assertions.json"));
  if (environment.wait_timer !== 0 || environment.prevent_self_review !== false)
    problems.push(`${path} must disable waits and self-review prevention for the documented interim policy`);
  if (liveAssertions.can_admins_bypass !== false)
    problems.push(`${path} live assertion must require administrator bypass to remain disabled`);
  if (JSON.stringify(environment.reviewers) !== JSON.stringify(reviewers))
    problems.push(`${path} must declare its exact interim reviewers`);
  if (
    environment.deployment_branch_policy?.protected_branches !== false ||
    environment.deployment_branch_policy?.custom_branch_policies !== true ||
    JSON.stringify(deploymentPolicies) !== JSON.stringify(policies)
  )
    problems.push(`${path} must declare its exact custom deployment policies`);
}

const desiredLabels = readdirSync(join(root, ".github/labels"), { withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith(".json"))
  .map(entry => ({ path: `.github/labels/${entry.name}`, payload: readJson(`.github/labels/${entry.name}`) }));
const expectedLabels = [
  { name: "bug", color: "d73a4a", description: "Something isn't working" },
  { name: "enhancement", color: "a2eeef", description: "New feature or request" },
  { name: "beta-feedback", color: "5319e7", description: "Sanitized public-beta evaluation outcome" },
  { name: "beta-adopter", color: "0e8a16", description: "Privacy-safe independent adopter qualification" },
];
const declaredIssueFormLabels = new Set();
for (const { path, payload } of desiredLabels) {
  if (
    typeof payload.name !== "string" ||
    payload.name.length === 0 ||
    payload.name !== payload.name.trim() ||
    !/^[0-9a-f]{6}$/u.test(payload.color ?? "") ||
    typeof payload.description !== "string" ||
    payload.description.length === 0 ||
    payload.description !== payload.description.trim()
  ) {
    problems.push(`${path} must declare a non-empty name/description and lowercase six-hex color`);
  }
  if (declaredIssueFormLabels.has(payload.name))
    problems.push(`${path} duplicates desired issue label ${payload.name}`);
  declaredIssueFormLabels.add(payload.name);
}
requireExactSet(
  [...declaredIssueFormLabels],
  expectedLabels.map(label => label.name),
  "desired issue labels",
);
for (const expected of expectedLabels) {
  const label = desiredLabels.find(candidate => candidate.payload.name === expected.name);
  if (!label || label.payload.color !== expected.color || label.payload.description !== expected.description) {
    problems.push(`desired issue label ${expected.name} must retain its exact payload`);
  }
}
for (const form of ["bug_report.yml", "feature_request.yml", "public_beta_feedback.yml", "adopter_check_in.yml"]) {
  const match = readText(`.github/ISSUE_TEMPLATE/${form}`).match(/^labels:\s*\[([^\]]*)\]\s*$/mu);
  const labels = match?.[1]
    .split(",")
    .map(label => label.trim().replace(/^['"]|['"]$/gu, ""))
    .filter(Boolean);
  if (!labels?.length) {
    problems.push(`${form} must declare at least one issue label`);
  } else {
    for (const label of labels) {
      if (!declaredIssueFormLabels.has(label)) problems.push(`${form} uses undeclared issue-form label ${label}`);
    }
  }
}
validateMainRuleset(readJson(".github/rulesets/main.json"), [
  "Release impact:15368",
  "TypeScript:15368",
  "JVM:15368",
  "Generated full-stack fixture:15368",
  "Generated frontend-only fixture:15368",
  "Public adjacent project-upgrade fixtures:15368",
  "plan:15368",
  "Detect standalone website changes:15368",
  "Build standalone website:15368",
  "Java and TypeScript analysis:15368",
  "CodeQL:57789",
  "dependency-review:15368",
  "Secret history scan:15368",
]);
validateTagRuleset(readJson(".github/rulesets/release-tags.json"));
validateActions(readJson(".github/settings/actions.json"), readJson(".github/settings/selected-actions.json"), [
  "gradle/actions/setup-gradle@9c971963bec38e04b3d30dcc455b5382be2fdbfb",
  "changesets/action@a45c4d594aa4e2c509dc14a9f2b3b67ba3780d0d",
]);
const permissions = readJson(".github/settings/workflow-permissions.json");
if (permissions.default_workflow_permissions !== "read" || permissions.can_approve_pull_request_reviews !== true)
  problems.push(
    "workflow-token defaults must remain read-only while allowing explicitly scoped trusted workflows to create release pull requests",
  );
const reviewer = [{ type: "User", id: 53398175 }];
validateEnvironment(".github/environments/package-release.json", {
  reviewers: reviewer,
  policies: [{ name: "main", type: "branch" }],
});
validateEnvironment(".github/environments/maven-central.json", {
  reviewers: reviewer,
  policies: [{ name: "main", type: "branch" }],
});
validateEnvironment(".github/environments/github-pages.json", {
  reviewers: [],
  policies: [{ name: "main", type: "branch" }],
});
if (
  readText(".github/CODEOWNERS")
    .split("\n")
    .filter(line => line.includes("@brunotot")).length !== 7
)
  problems.push("CODEOWNERS must retain the interim valid @brunotot owner for every protected path");

if (problems.length) {
  console.error("Repository security desired-state policy failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}
console.log(
  "Repository security desired-state policy passed: main/tags, Actions, workflow defaults, 3 environments, and issue-form labels.",
);
