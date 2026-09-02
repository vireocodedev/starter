import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { publicReleaseIdentity, readJson } from "./lib/anonymous-consumer-environment.mjs";
import { validateApplicationIdentity } from "./lib/application-projection-contract.mjs";
import {
  buildExecutionPlan,
  cleanupAnonymousConsumerRunRoot,
  deploymentContractProblems,
  execute,
  executePlanForTest,
  finalizationFailureFinding,
  finishAnonymousConsumerRun,
  hasExpectedUpgradeLastUpgrade,
  installedVireoPackageNames,
  parseBoundedJsonOutput,
  preflightFailureFinding,
  validateCreateDryRunJson,
  validateDoctorJson,
  validateManagedProvenance,
  validatePolicy,
  validateReleaseIdentityJson,
  validateRegistryMetadataJson,
  validateRemovalReceipt,
} from "./anonymous-consumer-gauntlet.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const policy = readJson(join(root, "contracts", "anonymous-consumer-gauntlet-policy.json"));
const release = publicReleaseIdentity(readJson(join(root, "contracts", "ecosystem-release-contract.json")));
const applicationProjectionContract = readJson(join(root, "contracts", "application-projection-contract.json"));

const deploymentVerifierFixture = `#!/usr/bin/env bash
set -euo pipefail
frontend_port=3000
compose_command=(docker compose)
response_headers="$(curl --fail --silent --show-error --head "http://127.0.0.1:\${frontend_port}/")"
for expected_header in \\
  "content-security-policy: default-src 'self'" \\
  "cross-origin-opener-policy: same-origin" \\
  "permissions-policy: camera=(), geolocation=(), microphone=()" \\
  "referrer-policy: strict-origin-when-cross-origin" \\
  "x-content-type-options: nosniff" \\
  "x-frame-options: DENY"; do
  if ! grep --ignore-case --fixed-strings --quiet "$expected_header" <<<"$response_headers"; then
    printf 'Frontend deployment is missing security header: %s\\n' "$expected_header" >&2
    exit 1
  fi
done
api_status="$(curl --silent --output /dev/null --write-out '%{http_code}' "http://127.0.0.1:\${frontend_port}/api/auth/me")"
if [[ "$api_status" != "401" ]]; then
  exit 1
fi
if ! curl --fail --silent --show-error "http://127.0.0.1:\${frontend_port}/actuator/health/readiness" | grep --quiet '"status":"UP"'; then
  exit 1
fi
"\${compose_command[@]}" --project-name deployment exec --no-TTY frontend \\
  wget --quiet --output-document=- http://app:8080/actuator/health/readiness | grep --quiet '"status":"UP"'
runtime_privileges="$("\${compose_command[@]}" --project-name deployment exec --no-TTY postgres \\
  psql --username "$POSTGRES_OWNER_USER" --tuples-only --no-align \\
  --command "SELECT has_schema_privilege('$runtime_user', 'public', 'CREATE'), has_table_privilege('$runtime_user', 'item', 'SELECT') AND has_table_privilege('$runtime_user', 'item', 'INSERT') AND has_table_privilege('$runtime_user', 'item', 'UPDATE') AND has_table_privilege('$runtime_user', 'item', 'DELETE'), has_table_privilege('$runtime_user', 'flyway_schema_history', 'INSERT') OR has_table_privilege('$runtime_user', 'flyway_schema_history', 'UPDATE') OR has_table_privilege('$runtime_user', 'flyway_schema_history', 'DELETE') OR has_table_privilege('$runtime_user', 'flyway_schema_history', 'TRUNCATE') OR has_table_privilege('$runtime_user', 'flyway_schema_history', 'REFERENCES') OR has_table_privilege('$runtime_user', 'flyway_schema_history', 'TRIGGER');")"
if [[ "$runtime_privileges" != "f|t|f" ]]; then
  exit 1
fi
`;

const deploymentComposeFixture = `services:
  app:
    environment:
      SPRING_DATASOURCE_USERNAME: \${POSTGRES_RUNTIME_USER:-starter_template_runtime}
      SPRING_DATASOURCE_PASSWORD: \${POSTGRES_RUNTIME_PASSWORD:?Set POSTGRES_RUNTIME_PASSWORD}
      SPRING_FLYWAY_USER: \${POSTGRES_OWNER_USER:-starter_template_owner}
      SPRING_FLYWAY_PASSWORD: \${POSTGRES_OWNER_PASSWORD:?Set POSTGRES_OWNER_PASSWORD}
`;

const deploymentConfigFixture = `export default {
  testDir: "./tests/deployment",
};
`;

const deploymentBrowserFixture = `import { expect, test } from "@playwright/test";
test("the built stack persists an authenticated item mutation", async ({ page }) => {
  const itemName = "Persistent Item";
  await page.getByRole("button", { name: "Create item" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill(itemName);
  await page.getByRole("button", { name: "Create item" }).last().click();
  await expect(page.getByText(itemName, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText(itemName, { exact: true })).toBeVisible();
});
`;

function writeDeploymentFixture(
  t,
  {
    verifier = deploymentVerifierFixture,
    compose = deploymentComposeFixture,
    config = deploymentConfigFixture,
    browserTests = { "tests/deployment/item-persistence.spec.ts": deploymentBrowserFixture },
  } = {},
) {
  const projectRoot = mkdtempSync(join(tmpdir(), "vireo-deployment-contract-"));
  mkdirSync(join(projectRoot, "scripts"), { recursive: true });
  mkdirSync(join(projectRoot, "frontend"), { recursive: true });
  writeFileSync(join(projectRoot, "scripts", "verify-deployment.sh"), verifier);
  writeFileSync(join(projectRoot, "compose.yaml"), compose);
  writeFileSync(join(projectRoot, "frontend", "playwright.deployment.config.ts"), config);
  for (const [relativePath, source] of Object.entries(browserTests)) {
    const path = join(projectRoot, "frontend", relativePath);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, source);
  }
  t.after(() => rmSync(projectRoot, { recursive: true, force: true }));
  return projectRoot;
}

function writeRemovalReceiptFixture(t, { metadata, receipt, residualManifest = false } = {}) {
  const projectRoot = mkdtempSync(join(tmpdir(), "vireo-removal-receipt-"));
  const vireoRoot = join(projectRoot, ".vireo");
  mkdirSync(vireoRoot, { recursive: true });
  const templateCommit = release.template.commit;
  writeFileSync(
    join(vireoRoot, "project.json"),
    `${JSON.stringify(metadata ?? { schemaVersion: 1, templateCommit }, null, 2)}\n`,
  );
  writeFileSync(
    join(vireoRoot, "remove-example.json"),
    `${JSON.stringify(receipt ?? { schemaVersion: 1, templateCommit, removed: true }, null, 2)}\n`,
  );
  if (residualManifest) writeFileSync(join(vireoRoot, "example-manifest.json"), "{}\n");
  t.after(() => rmSync(projectRoot, { recursive: true, force: true }));
  return projectRoot;
}

const identityOptions = new Map([
  ["--name", "projectName"],
  ["--display-name", "displayName"],
  ["--owner-name", "ownerName"],
  ["--repository-url", "repositoryUrl"],
  ["--support-url", "supportUrl"],
  ["--security-contact", "securityContact"],
]);

function effectiveCreateIdentity(operation) {
  const createIndex = operation.arguments.indexOf("create-vireo");
  assert.notEqual(createIndex, -1, `${operation.id} is not a create-vireo command`);
  const directory = operation.arguments[createIndex + 1];
  assert.equal(typeof directory, "string", `${operation.id} has no create-vireo target directory`);
  const identity = { projectName: basename(directory), displayName: basename(directory) };
  for (let index = createIndex + 2; index < operation.arguments.length; index += 1) {
    const field = identityOptions.get(operation.arguments[index]);
    if (!field) continue;
    assert.equal(
      typeof operation.arguments[index + 1],
      "string",
      `${operation.id} has no value for ${operation.arguments[index]}`,
    );
    identity[field] = operation.arguments[index + 1];
    index += 1;
  }
  return identity;
}

test("gauntlet policy covers every required scenario with exact public identity", () => {
  assert.deepEqual(validatePolicy(policy, release), []);
  assert.equal(policy.scenarios.length, policy.requiredScenarios.length);
  assert.ok(policy.scenarios.every(scenario => Array.isArray(scenario.recipe) && scenario.recipe.length > 0));
  assert.equal(
    new Set(policy.scenarios.map(scenario => JSON.stringify(scenario.recipe))).size,
    policy.scenarios.length,
  );
});

test("sample removal receipt binds an applied removal to the exact public Template and clears ownership", t => {
  const projectRoot = writeRemovalReceiptFixture(t);
  assert.doesNotThrow(() => validateRemovalReceipt({ projectRoot, expectedTemplateCommit: release.template.commit }));
});

test("sample removal receipt rejects attribution, state, schema, residual, and file mutants", t => {
  const otherCommit = "0".repeat(40);
  const mutations = [
    {
      name: "wrong receipt commit",
      fixture: { receipt: { schemaVersion: 1, templateCommit: otherCommit, removed: true } },
      expected: /does not match the generated project's Template commit/u,
    },
    {
      name: "wrong public project commit",
      fixture: {
        metadata: { schemaVersion: 1, templateCommit: otherCommit },
        receipt: { schemaVersion: 1, templateCommit: otherCommit, removed: true },
      },
      expected: /does not match the exact public Template commit/u,
    },
    {
      name: "receipt reports no removal",
      fixture: { receipt: { schemaVersion: 1, templateCommit: release.template.commit, removed: false } },
      expected: /does not confirm an applied removal/u,
    },
    {
      name: "unsupported receipt schema",
      fixture: { receipt: { schemaVersion: 2, templateCommit: release.template.commit, removed: true } },
      expected: /unsupported schema version/u,
    },
    {
      name: "malformed receipt commit",
      fixture: { receipt: { schemaVersion: 1, templateCommit: true, removed: true } },
      expected: /invalid Template commit/u,
    },
    {
      name: "malformed project metadata commit",
      fixture: { metadata: { schemaVersion: 1, templateCommit: [] } },
      expected: /invalid sample-removal identity/u,
    },
    {
      name: "residual ownership manifest",
      fixture: { residualManifest: true },
      expected: /left its example ownership manifest behind/u,
    },
  ];
  for (const mutation of mutations) {
    const projectRoot = writeRemovalReceiptFixture(t, mutation.fixture);
    assert.throws(
      () => validateRemovalReceipt({ projectRoot, expectedTemplateCommit: release.template.commit }),
      mutation.expected,
      mutation.name,
    );
  }

  for (const [name, path, contents, expected] of [
    ["missing receipt", ".vireo/remove-example.json", undefined, /Sample removal receipt is missing/u],
    ["malformed receipt", ".vireo/remove-example.json", "{", /Sample removal receipt must contain valid JSON/u],
    ["missing project metadata", ".vireo/project.json", undefined, /Project metadata is missing/u],
    ["malformed project metadata", ".vireo/project.json", "{", /Project metadata must contain valid JSON/u],
  ]) {
    const projectRoot = writeRemovalReceiptFixture(t);
    const target = join(projectRoot, path);
    if (contents === undefined) rmSync(target);
    else writeFileSync(target, contents);
    assert.throws(
      () => validateRemovalReceipt({ projectRoot, expectedTemplateCommit: release.template.commit }),
      expected,
      name,
    );
  }

  for (const [name, expectedTemplateCommit] of [
    ["missing public Template commit", undefined],
    ["malformed public Template commit", "not-a-template-commit"],
  ]) {
    const projectRoot = writeRemovalReceiptFixture(t);
    assert.throws(
      () => validateRemovalReceipt({ projectRoot, expectedTemplateCommit }),
      /requires the exact public Template commit/u,
      name,
    );
  }
});

test("public gauntlets derive the unique adjacent edge ending at the exact published release", () => {
  const upgradePolicy = readJson(join(root, "contracts", "project-upgrade-policy.json"));
  const matching = upgradePolicy.requiredEdges.filter(edge => edge.to === release.createVireoVersion);
  assert.equal(matching.length, 1);
  const plan = buildExecutionPlan({ policy, release, upgradePolicy, consumerRoot: "/tmp/vireo-anonymous-plan" });
  const upgrades = plan
    .find(scenario => scenario.id === "adjacent-public-upgrades")
    .operations.filter(operation => operation.kind === "assert-upgraded-consumer");
  assert.ok(upgrades.every(operation => operation.source.createVireoVersion === matching[0].from));
  assert.ok(upgrades.every(operation => operation.target.createVireoVersion === release.createVireoVersion));
  assert.ok(upgrades.every(operation => operation.lockfileRefresh === (matching[0].lockfileRefresh ?? "required")));
  assert.deepEqual(
    Object.fromEntries(upgrades.map(operation => [operation.profile, operation.lockfileRefresh])),
    { frontend: "not-required", "full-stack": "not-required" },
    "both public upgrade profiles retain the exact declared edge lockfile policy",
  );
  const [upgrade] = upgrades;
  const expectedLastUpgrade = {
    schemaVersion: 2,
    from: upgrade.source.createVireoVersion,
    to: upgrade.target.createVireoVersion,
    sourceTemplateCommit: upgrade.source.template.commit,
    targetTemplateCommit: upgrade.target.template.commit,
    sourceTemplateVersion: upgrade.source.template.version,
    targetTemplateVersion: upgrade.target.template.version,
    sourceTemplateTag: upgrade.source.template.tag,
    targetTemplateTag: upgrade.target.template.tag,
    lockfileRefresh: "not-required",
  };
  assert.equal(hasExpectedUpgradeLastUpgrade(expectedLastUpgrade, upgrade), true);
  assert.equal(
    hasExpectedUpgradeLastUpgrade({ ...expectedLastUpgrade, lockfileRefresh: "required" }, upgrade),
    false,
    "a receipt with a mismatched declared lockfile policy must fail",
  );
  const requiredPolicy = structuredClone(upgradePolicy);
  delete requiredPolicy.requiredEdges.find(edge => edge.to === release.createVireoVersion).lockfileRefresh;
  const requiredUpgrade = buildExecutionPlan({
    policy,
    release,
    upgradePolicy: requiredPolicy,
    consumerRoot: "/tmp/vireo-anonymous-plan",
  })
    .find(scenario => scenario.id === "adjacent-public-upgrades")
    .operations.find(operation => operation.kind === "assert-upgraded-consumer");
  assert.equal(requiredUpgrade.lockfileRefresh, "required");
  assert.equal(
    hasExpectedUpgradeLastUpgrade({ ...expectedLastUpgrade, lockfileRefresh: "required" }, requiredUpgrade),
    true,
  );
  const candidatePolicy = structuredClone(upgradePolicy);
  candidatePolicy.candidateRelease = "unpublished-candidate";
  const candidatePlan = buildExecutionPlan({
    policy,
    release,
    upgradePolicy: candidatePolicy,
    consumerRoot: "/tmp/vireo-anonymous-plan",
  });
  assert.deepEqual(
    candidatePlan
      .find(scenario => scenario.id === "adjacent-public-upgrades")
      .operations.filter(operation => operation.kind === "assert-upgraded-consumer")
      .map(operation => [
        operation.source.createVireoVersion,
        operation.target.createVireoVersion,
        operation.lockfileRefresh,
      ]),
    upgrades.map(operation => [
      operation.source.createVireoVersion,
      operation.target.createVireoVersion,
      operation.lockfileRefresh,
    ]),
  );
});

test("deterministic plan gives a fake executor every required recipe and refusal", () => {
  const upgradePolicy = readJson(join(root, "contracts", "project-upgrade-policy.json"));
  const plan = buildExecutionPlan({ policy, release, upgradePolicy, consumerRoot: "/tmp/vireo-anonymous-plan" });
  assert.deepEqual(
    plan.map(scenario => scenario.id),
    policy.requiredScenarios,
  );
  assert.ok(plan.every(scenario => scenario.operations.length > 0));
  assert.ok(plan.flatMap(scenario => scenario.operations).some(operation => operation.expectedExit === 1));
  assert.ok(
    plan
      .find(scenario => scenario.id === "cli-adversity")
      .operations.some(operation => operation.id === "template-download-retry"),
  );
  const dryRun = plan
    .find(scenario => scenario.id === "cli-adversity")
    .operations.find(operation => operation.id === "cli-json-dry-run");
  assert.equal(dryRun.arguments.filter(argument => argument === "--profile").length, 1);
  assert.equal(dryRun.arguments[dryRun.arguments.indexOf("--profile") + 1], "frontend");
  assert.ok(dryRun.arguments.includes(`--package=create-vireo@${release.createVireoVersion}`));
  for (const flag of ["--dry-run", "--json", "--yes", "--no-git"]) assert.ok(dryRun.arguments.includes(flag));
  const operations = plan.flatMap(scenario => scenario.operations);
  const registryOperations = plan
    .find(scenario => scenario.id === "public-artifacts")
    .operations.filter(operation => operation.id.startsWith("registry-"));
  assert.equal(registryOperations.length, release.npm.length);
  assert.deepEqual(
    registryOperations.map(operation => operation.arguments),
    release.npm.map(({ name, version }) => ["npm", "view", `${name}@${version}`, "name", "version", "--json"]),
  );
  const postgresqlProductionCompose = operations.filter(operation => operation.id === "postgresql-production-compose");
  assert.equal(postgresqlProductionCompose.length, 1);
  assert.equal(postgresqlProductionCompose[0].executable, "bash");
  assert.deepEqual(postgresqlProductionCompose[0].arguments, ["scripts/verify-deployment.sh"]);
  assert.equal(
    operations.filter(operation =>
      operation.arguments.some(argument => String(argument).endsWith("collect-public-release-evidence.mjs")),
    ).length,
    1,
  );
  assert.ok(
    operations
      .find(operation =>
        operation.arguments.some(argument => String(argument).endsWith("collect-public-release-evidence.mjs")),
      )
      .arguments.includes("--output-relative-paths"),
  );
  assert.equal(
    plan
      .find(scenario => scenario.id === "adjacent-public-upgrades")
      .operations.filter(operation => operation.id.includes("managed-refusal-mutation")).length,
    2,
  );
  assert.equal(
    plan
      .find(scenario => scenario.id === "adjacent-public-upgrades")
      .operations.filter(
        operation => operation.arguments.includes("generate") && operation.arguments.includes("entity"),
      ).length,
    2,
  );
  const upgrades = plan
    .find(scenario => scenario.id === "adjacent-public-upgrades")
    .operations.filter(operation => operation.kind === "assert-upgraded-consumer");
  assert.equal(upgrades.length, 2);
  const upgradeEdge = readJson(join(root, "contracts", "project-upgrade-policy.json")).requiredEdges.find(
    edge => edge.to === release.createVireoVersion,
  );
  assert.ok(upgrades.every(operation => operation.source.createVireoVersion === upgradeEdge.from));
  assert.ok(upgrades.every(operation => operation.target.createVireoVersion === release.createVireoVersion));
  assert.equal(
    upgrades.filter(operation => operation.target.createVireoVersion === release.createVireoVersion).length,
    upgrades.length,
  );
  assert.equal(
    plan
      .find(scenario => scenario.id === "adjacent-public-upgrades")
      .operations.filter(operation => operation.id.endsWith("-doctor-json")).length,
    2,
  );
  assert.ok(
    !plan
      .find(scenario => scenario.id === "adjacent-public-upgrades")
      .operations.some(operation => operation.kind === "assert-project-identity"),
  );
  const adversity = plan.find(scenario => scenario.id === "cli-adversity").operations.map(operation => operation.id);
  assert.ok(adversity.includes("retry-project-setup"));
  assert.ok(adversity.includes("retry-project-verify"));
  const lifecycle = plan
    .find(scenario => scenario.id === "capability-lifecycle")
    .operations.map(operation => operation.id);
  assert.ok(lifecycle.includes("capability-customized-snapshot"));
  assert.ok(lifecycle.includes("capability-refusal-preserves-customization"));
  const removal = plan
    .find(scenario => scenario.id === "sample-removal-and-ejection")
    .operations.map(operation => operation.id);
  assert.ok(removal.includes("sample-removal-first-apply-snapshot"));
  assert.ok(removal.includes("sample-removal-repeat-preserves-tree"));
});

test("deployment contract validates executable security, proxy, readiness, database, and persistence boundaries", t => {
  const projectRoot = writeDeploymentFixture(t);
  assert.equal(deploymentVerifierFixture.includes("migration"), false);
  assert.equal(spawnSync("bash", ["-n", join(projectRoot, "scripts", "verify-deployment.sh")]).status, 0);
  assert.deepEqual(deploymentContractProblems(projectRoot), []);
});

test("deployment contract scopes Compose credentials to the app environment and separate runtime and owner roles", t => {
  const cases = [
    [
      "SPRING_DATASOURCE_USERNAME: ${POSTGRES_RUNTIME_USER",
      "SPRING_DATASOURCE_USERNAME: ${POSTGRES_OWNER_USER",
      "Compose does not bind the application datasource to the PostgreSQL runtime user.",
    ],
    [
      "SPRING_DATASOURCE_PASSWORD: ${POSTGRES_RUNTIME_PASSWORD",
      "SPRING_DATASOURCE_PASSWORD: ${POSTGRES_OWNER_PASSWORD",
      "Compose does not bind the application datasource to the PostgreSQL runtime password.",
    ],
    [
      "SPRING_FLYWAY_USER: ${POSTGRES_OWNER_USER",
      "SPRING_FLYWAY_USER: ${POSTGRES_RUNTIME_USER",
      "Compose does not bind Flyway to the PostgreSQL owner user.",
    ],
    [
      "SPRING_FLYWAY_PASSWORD: ${POSTGRES_OWNER_PASSWORD",
      "SPRING_FLYWAY_PASSWORD: ${POSTGRES_RUNTIME_PASSWORD",
      "Compose does not bind Flyway to the PostgreSQL owner password.",
    ],
  ];
  for (const [from, to, expected] of cases) {
    const projectRoot = writeDeploymentFixture(t, { compose: deploymentComposeFixture.replace(from, to) });
    assert.deepEqual(deploymentContractProblems(projectRoot), [expected]);
  }

  const outOfScopeOwner = writeDeploymentFixture(t, {
    compose: deploymentComposeFixture
      .replace("SPRING_FLYWAY_USER: ${POSTGRES_OWNER_USER", "SPRING_FLYWAY_USER: ${POSTGRES_RUNTIME_USER")
      .concat(
        "  postgres:\n    environment:\n      SPRING_FLYWAY_USER: ${POSTGRES_OWNER_USER:-starter_template_owner}\n",
      ),
  });
  assert.deepEqual(deploymentContractProblems(outOfScopeOwner), [
    "Compose does not bind Flyway to the PostgreSQL owner user.",
  ]);
});

test("deployment contract rejects every missing Flyway-history mutation boundary and a combined privilege result", t => {
  for (const privilege of ["INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER"]) {
    const projectRoot = writeDeploymentFixture(t, {
      verifier: deploymentVerifierFixture.replace(
        `has_table_privilege('$runtime_user', 'flyway_schema_history', '${privilege}')`,
        "false",
      ),
    });
    assert.deepEqual(deploymentContractProblems(projectRoot), [
      `Deployment verifier does not query runtime Flyway history ${privilege} mutation privilege.`,
    ]);
  }

  const privilegeResult = writeDeploymentFixture(t, {
    verifier: deploymentVerifierFixture.replace("f|t|f", "f|t|x"),
  });
  assert.deepEqual(deploymentContractProblems(privilegeResult), [
    "Deployment verifier does not require f|t|f runtime database privilege separation.",
  ]);
});

test("deployment contract derives all configured deployment specs and requires persistence after reload", t => {
  const persistence = writeDeploymentFixture(t, {
    browserTests: {
      "tests/deployment/item-persistence.spec.ts": deploymentBrowserFixture.replace("  await page.reload();\n", ""),
    },
  });
  assert.deepEqual(deploymentContractProblems(persistence), [
    "Deployment Playwright test does not prove an Item persists after creation and reload.",
  ]);

  const splitFlow = writeDeploymentFixture(t, {
    browserTests: {
      "tests/deployment/item-persistence.spec.ts": `${deploymentBrowserFixture.replace(
        "  await page.reload();\n  await expect(page.getByText(itemName, { exact: true })).toBeVisible();\n",
        "",
      )}\ntest("unrelated reload", async ({ page }) => {\n  await page.reload();\n  await expect(page.getByText(itemName, { exact: true })).toBeVisible();\n});\n`,
    },
  });
  assert.deepEqual(deploymentContractProblems(splitFlow), [
    "Deployment Playwright test does not prove an Item persists after creation and reload.",
  ]);

  const falseBranch = writeDeploymentFixture(t, {
    browserTests: {
      "tests/deployment/item-persistence.spec.ts": deploymentBrowserFixture
        .replace('  const itemName = "Persistent Item";', '  if (false) {\n  const itemName = "Persistent Item";')
        .replace(
          "  await expect(page.getByText(itemName, { exact: true })).toBeVisible();\n});",
          "  await expect(page.getByText(itemName, { exact: true })).toBeVisible();\n  }\n});",
        ),
    },
  });
  assert.deepEqual(deploymentContractProblems(falseBranch), [
    "Deployment Playwright test does not prove an Item persists after creation and reload.",
  ]);

  const templateLiteral = writeDeploymentFixture(t, {
    browserTests: {
      "tests/deployment/item-persistence.spec.ts": deploymentBrowserFixture.replace(
        '  await page.getByRole("button", { name: "Create item" }).click();\n  await page.getByRole("textbox", { name: "Name" }).fill(itemName);\n  await page.getByRole("button", { name: "Create item" }).last().click();\n  await expect(page.getByText(itemName, { exact: true })).toBeVisible();\n  await page.reload();\n  await expect(page.getByText(itemName, { exact: true })).toBeVisible();',
        '  const unreachable = `\n  await page.getByRole("button", { name: "Create item" }).click();\n  await page.getByRole("textbox", { name: "Name" }).fill(itemName);\n  await page.getByRole("button", { name: "Create item" }).last().click();\n  await expect(page.getByText(itemName, { exact: true })).toBeVisible();\n  await page.reload();\n  await expect(page.getByText(itemName, { exact: true })).toBeVisible();\n  `;',
      ),
    },
  });
  assert.deepEqual(deploymentContractProblems(templateLiteral), [
    "Deployment Playwright test does not prove an Item persists after creation and reload.",
  ]);

  for (const source of [
    deploymentBrowserFixture.replace('test("the built stack', 'test.skip("the built stack'),
    deploymentBrowserFixture.replace('test("the built stack', 'test.fixme("the built stack'),
    'test.describe.skip("deployment suite", () => {\n' + deploymentBrowserFixture + "});\n",
    'test.describe.fixme("deployment suite", () => {\n' + deploymentBrowserFixture + "});\n",
    deploymentBrowserFixture.replace(
      '  const itemName = "Persistent Item";',
      '  return;\n  const itemName = "Persistent Item";',
    ),
    deploymentBrowserFixture.replace(
      '  const itemName = "Persistent Item";',
      '  test.skip(true, "disabled");\n  const itemName = "Persistent Item";',
    ),
    deploymentBrowserFixture.replace(
      '  const itemName = "Persistent Item";',
      '  test.fixme(true, "disabled");\n  const itemName = "Persistent Item";',
    ),
    deploymentBrowserFixture.replace(
      '  const itemName = "Persistent Item";',
      '  if (enabled) {\n    test.skip(true, "disabled");\n  }\n  const itemName = "Persistent Item";',
    ),
    deploymentBrowserFixture.replace(
      '  const itemName = "Persistent Item";',
      '  if (enabled) {\n    return;\n  }\n  const itemName = "Persistent Item";',
    ),
    deploymentBrowserFixture.replace(
      '  const itemName = "Persistent Item";',
      '  if (enabled) {\n    throw new Error("disabled");\n  }\n  const itemName = "Persistent Item";',
    ),
    deploymentBrowserFixture.replace(
      '  await page.getByRole("button", { name: "Create item" }).click();',
      '  await Promise.resolve(\'page.getByRole("button", { name: "Create item" }).click()\');',
    ),
  ]) {
    const projectRoot = writeDeploymentFixture(t, {
      browserTests: { "tests/deployment/item-persistence.spec.ts": source },
    });
    assert.deepEqual(deploymentContractProblems(projectRoot), [
      "Deployment Playwright test does not prove an Item persists after creation and reload.",
    ]);
  }

  const renamedMultiple = writeDeploymentFixture(t, {
    browserTests: {
      "tests/deployment/login.spec.ts": "test('login', async () => {});\n",
      "tests/deployment/nested/item-durability.test.ts": deploymentBrowserFixture,
    },
  });
  assert.deepEqual(deploymentContractProblems(renamedMultiple), []);

  for (const option of ["testMatch", "testIgnore"]) {
    const projectRoot = writeDeploymentFixture(t, {
      config: deploymentConfigFixture.replace("};", "  " + option + ': "**/*.spec.ts",\\n};'),
    });
    assert.deepEqual(deploymentContractProblems(projectRoot), [
      "Generated deployment Playwright persistence test is missing.",
    ]);
  }
});

test("deployment contract ignores comments and dead strings while enforcing network boundaries", t => {
  const security = writeDeploymentFixture(t, {
    verifier: `${deploymentVerifierFixture.replace("x-frame-options: DENY", "x-frame-options: SAMEORIGIN")}\nprintf 'x-frame-options: DENY\\n'\n`,
  });
  assert.deepEqual(deploymentContractProblems(security), [
    "Deployment verifier does not enforce the x-frame-options header.",
  ]);

  const proxy = writeDeploymentFixture(t, {
    verifier: `${deploymentVerifierFixture.replace("/api/auth/me", "/api/session")}\n# /api/auth/me\nprintf '/api/auth/me\\n'\n`,
  });
  assert.deepEqual(deploymentContractProblems(proxy), [
    "Deployment verifier does not prove the /api/auth/me proxy returns 401.",
  ]);

  const publicReadiness = writeDeploymentFixture(t, {
    verifier: deploymentVerifierFixture.replace(
      "http://127.0.0.1:${frontend_port}/actuator/health/readiness",
      "http://127.0.0.1:${frontend_port}/actuator/health/live",
    ),
  });
  assert.deepEqual(deploymentContractProblems(publicReadiness), [
    "Deployment verifier does not prove public backend readiness.",
  ]);

  const containerReadiness = writeDeploymentFixture(t, {
    verifier: deploymentVerifierFixture.replace("http://app:8080/actuator/health/readiness", "http://app:8080/healthz"),
  });
  assert.deepEqual(deploymentContractProblems(containerReadiness), [
    "Deployment verifier does not prove container backend readiness.",
  ]);
});

test("deployment contract rejects evidence hidden in unreachable shell flow and SQL comments", t => {
  const uncalledFunction = writeDeploymentFixture(t, {
    verifier: "function prove_deployment() {\n" + deploymentVerifierFixture + "}\n",
  });
  assert.ok(
    deploymentContractProblems(uncalledFunction).includes(
      "Deployment verifier does not enforce the content-security-policy header.",
    ),
  );

  const constantFalse = writeDeploymentFixture(t, {
    verifier: "if false; then\n" + deploymentVerifierFixture + "fi\n",
  });
  assert.ok(
    deploymentContractProblems(constantFalse).includes(
      "Deployment verifier does not prove the /api/auth/me proxy returns 401.",
    ),
  );

  for (const verifier of [
    "exit 0\n" + deploymentVerifierFixture,
    "exit 0;\n" + deploymentVerifierFixture,
    "exit 0 # already successful\n" + deploymentVerifierFixture,
    "  exit 0;\n" + deploymentVerifierFixture,
    "printf 'early'; exit 0\n" + deploymentVerifierFixture,
    ":; exit 0\n" + deploymentVerifierFixture,
    "if ! true; then\n" + deploymentVerifierFixture + "fi\n",
    "while false; do\n" + deploymentVerifierFixture + "done\n",
    "function prove_deployment() {\n" + deploymentVerifierFixture + "}\nif false; then\n  prove_deployment\nfi\n",
    "function prove_deployment() {\n" + deploymentVerifierFixture + "}\nexit 0\nprove_deployment\n",
  ]) {
    const projectRoot = writeDeploymentFixture(t, { verifier });
    assert.ok(
      deploymentContractProblems(projectRoot).includes(
        "Deployment verifier does not enforce the content-security-policy header.",
      ),
    );
  }

  const bashTrue = writeDeploymentFixture(t, {
    verifier: "if [[ false ]]; then\n" + deploymentVerifierFixture + "fi\n",
  });
  assert.deepEqual(deploymentContractProblems(bashTrue), []);

  const commentedFailure = writeDeploymentFixture(t, {
    verifier: deploymentVerifierFixture.replace("    exit 1", "    : # exit 1"),
  });
  assert.ok(
    deploymentContractProblems(commentedFailure).includes(
      "Deployment verifier does not enforce the content-security-policy header.",
    ),
  );

  const sqlComment = writeDeploymentFixture(t, {
    verifier: deploymentVerifierFixture.replace(
      "SELECT has_schema_privilege",
      "SELECT /* bypass */ has_schema_privilege",
    ),
  });
  assert.ok(
    deploymentContractProblems(sqlComment).includes(
      "Deployment verifier privilege SQL must not contain SQL comment markers.",
    ),
  );
});

test("shared create commands carry one valid release identity except for their intended identity refusal", () => {
  const upgradePolicy = readJson(join(root, "contracts", "project-upgrade-policy.json"));
  const plan = buildExecutionPlan({ policy, release, upgradePolicy, consumerRoot: "/tmp/vireo-anonymous-plan" });
  const creates = plan
    .flatMap(scenario => scenario.operations)
    .filter(operation => operation.arguments?.includes("create-vireo") && operation.arguments.includes("--owner-name"));
  assert.ok(creates.length > 0);
  const intendedProblems = new Map([
    ["invalid-project-name", ["projectName must use kebab-case format"]],
    ["invalid-repository-url", ["repositoryUrl must use https-url format"]],
    ["invalid-support-url", ["supportUrl must use https-or-mailto-url format"]],
  ]);
  for (const operation of creates) {
    for (const option of [
      "--owner-name",
      "--display-name",
      "--repository-url",
      "--support-url",
      "--security-contact",
    ]) {
      assert.ok(operation.arguments.includes(option), `${operation.id} must bind ${option}`);
    }
    const identity = effectiveCreateIdentity(operation);
    assert.equal(identity.securityContact, "mailto:security@example.invalid", `${operation.id} masks security contact`);
    assert.equal(identity.ownerName, "Vireo CI", `${operation.id} masks owner identity`);
    assert.equal(identity.displayName, "Anonymous Gauntlet", `${operation.id} masks display identity`);
    assert.deepEqual(
      validateApplicationIdentity(applicationProjectionContract, identity),
      intendedProblems.get(operation.id) ?? [],
      `${operation.id} has an unexpected masked public identity defect`,
    );
  }
  for (const id of [
    "invalid-java-package",
    "occupied-target-refusal",
    "template-download-failure",
    "template-download-retry",
  ]) {
    const operation = creates.find(candidate => candidate.id === id);
    assert.ok(operation, `missing ${id}`);
    assert.deepEqual(
      validateApplicationIdentity(applicationProjectionContract, effectiveCreateIdentity(operation)),
      [],
    );
  }
  for (const id of intendedProblems.keys())
    assert.ok(
      creates.some(operation => operation.id === id),
      `missing ${id}`,
    );
});

test("JSON command assertions accept only bounded exact ready reports", () => {
  const dryRunDirectory = "/tmp/anonymous/dry-run";
  const dryRun = {
    directory: dryRunDirectory,
    projectName: "dry-run",
    profile: "frontend",
    packageManager: "npm",
    templateCommit: release.template.commit,
    dryRun: true,
  };
  assert.equal(
    validateCreateDryRunJson(parseBoundedJsonOutput(JSON.stringify(dryRun)), {
      directory: dryRunDirectory,
      profile: "frontend",
      release,
    }).type,
    "create-vireo-dry-run",
  );
  assert.throws(() => parseBoundedJsonOutput("notice\n{}"), /complete JSON/u);
  assert.throws(() => parseBoundedJsonOutput("{"), /complete JSON/u);
  assert.throws(() => parseBoundedJsonOutput("x".repeat(9), { maximumBytes: 8 }), /exceeds/u);
  assert.throws(
    () =>
      validateCreateDryRunJson(
        { ...dryRun, database: "h2" },
        { directory: dryRunDirectory, profile: "frontend", release },
      ),
    /full-stack-only/u,
  );
  assert.throws(
    () =>
      validateCreateDryRunJson(
        { ...dryRun, profile: "full-stack", javaPackage: "com.example.dryrun", database: "h2" },
        { directory: dryRunDirectory, profile: "frontend", release },
      ),
    /exact public frontend identity/u,
  );
  const doctor = {
    schemaVersion: 1,
    ok: true,
    project: "frontend",
    profile: "frontend",
    database: undefined,
    databaseMode: "frontend",
    results: [{ code: "VIR-ENV-001", status: "pass", summary: "Node 24" }],
  };
  assert.equal(
    validateDoctorJson(doctor, {
      project: "frontend",
      profile: "frontend",
      database: undefined,
      databaseMode: "frontend",
    }).type,
    "doctor",
  );
  assert.throws(
    () =>
      validateDoctorJson(
        { ...doctor, ok: false },
        { project: "frontend", profile: "frontend", database: undefined, databaseMode: "frontend" },
      ),
    /expected ready/u,
  );
  assert.equal(validateReleaseIdentityJson({ phase: "release", ok: true, problems: [] }).type, "release-identity");
  assert.throws(() => validateReleaseIdentityJson({ phase: "creation", ok: true, problems: [] }), /exact ready/u);
});

test("npm registry metadata accepts only an exact direct object or singleton result", () => {
  const expected = { name: "@vireocodedev/ui", version: "0.3.1" };
  assert.deepEqual(validateRegistryMetadataJson(expected, expected), {
    type: "registry-metadata",
    coordinate: "@vireocodedev/ui@0.3.1",
  });
  assert.deepEqual(validateRegistryMetadataJson([expected], expected), {
    type: "registry-metadata",
    coordinate: "@vireocodedev/ui@0.3.1",
  });
  for (const malformed of [[], [expected, expected], [[expected]], [null], null, "metadata", 0, false]) {
    assert.throws(() => validateRegistryMetadataJson(malformed, expected));
  }
  assert.throws(() => validateRegistryMetadataJson({ name: expected.name }, expected), /exact public/u);
  assert.throws(() => validateRegistryMetadataJson({ version: expected.version }, expected), /exact public/u);
  assert.throws(() => validateRegistryMetadataJson({ ...expected, version: "0.3.2" }, expected), /exact public/u);
  assert.throws(
    () => validateRegistryMetadataJson([{ ...expected, name: "@vireocodedev/query" }], expected),
    /exact public/u,
  );
});

test("preflight failures have a stable machine-actionable finding", () => {
  assert.deepEqual(preflightFailureFinding(), {
    id: "VIR-GAUNTLET-PREFLIGHT",
    owner: "framework",
    severity: "error",
    remediation: "Repair the exact public release identity or its provider-backed publication evidence.",
    evidenceReferences: ["preflight"],
  });
});

test("finalization failures have a stable machine-actionable finding", () => {
  assert.deepEqual(finalizationFailureFinding(), {
    id: "VIR-GAUNTLET-FINALIZATION",
    owner: "framework",
    severity: "error",
    remediation:
      "Repair anonymous-consumer evidence finalization or temporary-run cleanup before release qualification.",
    evidenceReferences: ["finalization"],
  });
});

test("anonymous run cleanup retries transient filesystem races with a bounded delay", async () => {
  const removals = [];
  const waits = [];
  const runRoot = join(tmpdir(), "vireo-anonymous-consumer-cleanup-retry");
  await cleanupAnonymousConsumerRunRoot({
    runRoot,
    maxRetries: 3,
    retryDelayMs: 7,
    remove: (path, options) => {
      removals.push({ path, options });
      if (removals.length < 3) {
        const error = new Error("directory is temporarily non-empty");
        error.code = "ENOTEMPTY";
        throw error;
      }
    },
    wait: async milliseconds => waits.push(milliseconds),
  });
  assert.equal(removals.length, 3);
  assert.deepEqual(waits, [7, 7]);
  assert.deepEqual(removals[0], {
    path: runRoot,
    options: { recursive: true, force: true },
  });
});

test("anonymous run cleanup rejects unsafe targets and bounds retry behavior", async () => {
  const temporaryDirectory = join(tmpdir(), "anonymous-cleanup-parent");
  const runRoot = join(temporaryDirectory, "vireo-anonymous-consumer-cleanup-exhaustion");
  for (const unsafe of ["/", temporaryDirectory, join(temporaryDirectory, "unrelated-sibling")]) {
    await assert.rejects(
      cleanupAnonymousConsumerRunRoot({ runRoot: unsafe, temporaryDirectory }),
      /direct, named child/u,
    );
  }

  let nontransientCalls = 0;
  const nontransient = new Error("access denied");
  nontransient.code = "EACCES";
  await assert.rejects(
    cleanupAnonymousConsumerRunRoot({
      runRoot,
      temporaryDirectory,
      remove: async () => {
        nontransientCalls += 1;
        throw nontransient;
      },
      wait: async () => {
        throw new Error("non-transient cleanup must not wait");
      },
    }),
    error => error === nontransient,
  );
  assert.equal(nontransientCalls, 1);

  let exhaustedCalls = 0;
  const waits = [];
  const exhausted = new Error("directory remains non-empty");
  exhausted.code = "ENOTEMPTY";
  await assert.rejects(
    cleanupAnonymousConsumerRunRoot({
      runRoot,
      temporaryDirectory,
      maxRetries: 2,
      retryDelayMs: 5,
      remove: async () => {
        exhaustedCalls += 1;
        throw exhausted;
      },
      wait: async milliseconds => waits.push(milliseconds),
    }),
    error => error === exhausted,
  );
  assert.equal(exhaustedCalls, 3);
  assert.deepEqual(waits, [5, 5]);
});

test("anonymous run finalization preserves the operation failure and reports cleanup failures", async () => {
  const primary = new Error("exact public coordinate assertion failed");
  await assert.rejects(
    finishAnonymousConsumerRun({
      primaryError: primary,
      checkpoint: () => {},
      cleanup: async () => {},
    }),
    error => error === primary,
  );

  await assert.rejects(
    finishAnonymousConsumerRun({
      primaryError: undefined,
      hasPrimaryError: true,
      checkpoint: () => {},
      cleanup: async () => {},
    }),
    error => error === undefined,
  );

  const cleanup = new Error("temporary directory remains non-empty");
  const cleanupOnlyEvidence = { status: "running", findings: [] };
  const cleanupOnlyCheckpoints = [];
  await assert.rejects(
    finishAnonymousConsumerRun({
      checkpoint: () => cleanupOnlyCheckpoints.push(structuredClone(cleanupOnlyEvidence)),
      cleanup: async () => {
        throw cleanup;
      },
      evidence: cleanupOnlyEvidence,
    }),
    error => error === cleanup,
  );
  assert.equal(cleanupOnlyEvidence.status, "failed");
  assert.deepEqual(cleanupOnlyEvidence.findings, [finalizationFailureFinding()]);
  assert.deepEqual(cleanupOnlyCheckpoints.at(-1), cleanupOnlyEvidence);

  const primaryAndCleanupEvidence = { status: "running", findings: [] };
  const primaryAndCleanupCheckpoints = [];
  await assert.rejects(
    finishAnonymousConsumerRun({
      primaryError: primary,
      checkpoint: () => primaryAndCleanupCheckpoints.push(structuredClone(primaryAndCleanupEvidence)),
      cleanup: async () => {
        throw cleanup;
      },
      evidence: primaryAndCleanupEvidence,
    }),
    error => {
      assert.ok(error instanceof AggregateError);
      assert.deepEqual(error.errors, [primary, cleanup]);
      assert.match(error.message, /failed and finalization was incomplete/u);
      return true;
    },
  );
  assert.equal(primaryAndCleanupEvidence.status, "failed");
  assert.deepEqual(primaryAndCleanupEvidence.findings, [finalizationFailureFinding()]);
  assert.deepEqual(primaryAndCleanupCheckpoints.at(-1), primaryAndCleanupEvidence);
});

test("malformed release input writes preflight evidence before any scenario can run", t => {
  const evidenceDirectory = mkdtempSync(join(tmpdir(), "vireo-malformed-release-preflight-"));
  t.after(() => rmSync(evidenceDirectory, { recursive: true, force: true }));
  const result = spawnSync(
    process.execPath,
    ["scripts/anonymous-consumer-gauntlet.mjs", "--evidence-dir", evidenceDirectory],
    {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        VIREO_GAUNTLET_RELEASE_ID: "npm-0.8.2_jvm-0.3.1-extra",
        VIREO_GAUNTLET_SOURCE_COMMIT: "a".repeat(40),
      },
    },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /requested release id is not an exact npm-x\.y\.z_jvm-x\.y\.z release id/u);
  const evidence = JSON.parse(readFileSync(join(evidenceDirectory, "evidence.json"), "utf8"));
  assert.equal(evidence.status, "failed");
  assert.deepEqual(evidence.findings, [preflightFailureFinding()]);
  assert.deepEqual(evidence.scenarios, []);
  assert.equal(evidence.releaseTagCommit, undefined);
});

test("fake executor preserves planned, expected-refusal, timeout, and failure evidence", async () => {
  const plan = [
    {
      id: "fixture",
      recipe: ["fixture"],
      operations: [
        { id: "pass", expectedExit: 0 },
        { id: "refusal", expectedExit: 1 },
      ],
    },
  ];
  const passed = await executePlanForTest(plan, async operation => ({
    exitCode: operation.expectedExit,
    timedOut: false,
    signal: null,
  }));
  assert.equal(passed.status, "passed");
  const planned = await executePlanForTest(
    plan,
    async () => {
      throw new Error("dry run executed");
    },
    { dryRun: true },
  );
  assert.equal(planned.status, "planned");
  const failed = await executePlanForTest(plan, async operation =>
    operation.id === "pass" ? { exitCode: 0, timedOut: true, signal: "SIGTERM" } : { exitCode: 1 },
  );
  assert.equal(failed.status, "failed");
  assert.equal(failed.scenarios[0].commands[0].status, "failed");
});

test("unexpected command failures retain only bounded, sanitized stream tails", async () => {
  let failure;
  try {
    await execute(
      {
        id: "unsafe-output",
        executable: process.execPath,
        arguments: [
          "-e",
          `console.log("${"x".repeat(5_000)} /tmp/vireo-anonymous-consumer-private?token=leak"); console.error("https://bruno:password@example.invalid/?api_key=leak Bearer leak"); process.exit(1);`,
        ],
        expectedExit: 0,
      },
      { cwd: root, env: process.env },
    );
  } catch (error) {
    failure = error;
  }
  assert.ok(failure instanceof Error);
  const result = failure.result;
  assert.ok(Buffer.byteLength(result.stdout.tail) <= 4_096);
  assert.ok(Buffer.byteLength(result.stderr.tail) <= 4_096);
  assert.equal(result.stdout.tail.includes("leak"), false);
  assert.equal(result.stderr.tail.includes("password"), false);
  assert.equal(result.stderr.tail.includes("bruno"), false);

  const passed = await execute(
    { id: "success", executable: process.execPath, arguments: ["-e", 'console.log("ok")'], expectedExit: 0 },
    { cwd: root, env: process.env },
  );
  assert.equal("tail" in passed.stdout, false);
  assert.equal("tail" in passed.stderr, false);
});

test("managed provenance rejects traversal and digest drift", () => {
  const directory = mkdtempSync(join(tmpdir(), "vireo-managed-"));
  writeFileSync(join(directory, "file.txt"), "actual");
  const manifest = {
    schemaVersion: 1,
    templateCommit: "a".repeat(40),
    files: [
      { path: "../escape", sha256: "b".repeat(64) },
      { path: "file.txt", sha256: "b".repeat(64) },
    ],
  };
  assert.match(validateManagedProvenance({ root: directory, manifest }).join("\n"), /unsafe|drift/u);
  assert.match(
    validateManagedProvenance({
      root: directory,
      manifest: { ...manifest, templateCommit: "a".repeat(40), files: [] },
      templateCommit: "b".repeat(40),
    }).join("\n"),
    /does not match/u,
  );
});

test("upgraded consumers validate only their installed exact Vireo subset", () => {
  const release = { npm: [{ name: "@vireocodedev/ui", version: "1.2.3" }] };
  const lock = {
    packages: {
      "node_modules/@vireocodedev/ui": {
        version: "1.2.3",
        resolved: "https://registry.npmjs.org/@vireocodedev/ui/-/ui.tgz",
        integrity: "sha512-x",
      },
      "node_modules/example/node_modules/@vireocodedev/ui": {
        version: "1.2.3",
        resolved: "https://registry.npmjs.org/@vireocodedev/ui/-/ui.tgz",
        integrity: "sha512-nested",
      },
    },
  };
  assert.deepEqual(installedVireoPackageNames({ lock, release }), ["@vireocodedev/ui"]);
  lock.packages["node_modules/@vireocodedev/ui"].version = "9.9.9";
  assert.throws(() => installedVireoPackageNames({ lock, release }));
  lock.packages["node_modules/@vireocodedev/ui"].version = "1.2.3";
  lock.packages["node_modules/example/node_modules/@vireocodedev/ui"].link = true;
  assert.throws(() => installedVireoPackageNames({ lock, release }));
});

test("gauntlet policy wiring remains public and scheduled", () => {
  const workflow = readFileSync(join(root, ".github/workflows/anonymous-consumer-gauntlet.yml"), "utf8");
  assert.match(workflow, /schedule:/u);
  assert.match(workflow, /consumer:gauntlet/u);
  assert.match(workflow, /permissions: \{\}/u);
  assert.match(workflow, /upload-artifact/u);
  assert.match(workflow, /playwright install --with-deps chromium/u);
  assert.match(workflow, /docker version/u);
  assert.match(workflow, /workflow_run\.head_sha/u);
  assert.match(workflow, /VIREO_GAUNTLET_RELEASE_ID: \$\{\{ inputs\.release_id \}\}/u);
  assert.match(workflow, /VIREO_GAUNTLET_SOURCE_COMMIT: \$\{\{ needs\.trusted-source\.outputs\.source_commit \}\}/u);
  assert.match(workflow, /git rev-parse HEAD/u);
  assert.match(workflow, /source_commit must be an exact 40-hex/u);
  assert.match(workflow, /workflow_dispatch is restricted to refs\/heads\/main/u);
  assert.match(workflow, /merge-base --is-ancestor "\$candidate" origin\/main/u);
  assert.match(workflow, /Revalidate trusted main ancestry before verifier execution/u);
  assert.match(workflow, /--evidence-dir "\$RUNNER_TEMP\/anonymous-consumer-evidence"/u);
  assert.doesNotMatch(workflow, /REQUESTED_RELEASE_ID|release_id=|--release-id|--source-commit/u);
  assert.match(workflow, /path: \$\{\{ runner\.temp \}\}\/anonymous-consumer-evidence/u);
  assert.doesNotMatch(workflow.match(/^\s*run:[\s\S]*?(?=^\s*-\s|^\s*\w)/gmu)?.join("\n") ?? "", /inputs\./u);
  assert.match(workflow, /head_repository\.full_name == github\.repository/u);
});
