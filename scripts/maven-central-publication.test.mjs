import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const publishScript = join(repositoryRoot, "jvm/scripts/publish-central-deployment.sh");
const waitScript = join(repositoryRoot, "jvm/scripts/wait-central-validation.sh");
const publishScriptSource = readFileSync(publishScript, "utf8");
const waitScriptSource = readFileSync(waitScript, "utf8");
const workflow = readFileSync(join(repositoryRoot, ".github/workflows/release-npm.yml"), "utf8");
const recoveryWorkflow = readFileSync(
  join(repositoryRoot, ".github/workflows/recover-maven-central-deployment.yml"),
  "utf8",
);
const verifyWorkflow = readFileSync(join(repositoryRoot, ".github/workflows/verify-maven-central.yml"), "utf8");
const uploadScript = readFileSync(join(repositoryRoot, "jvm/scripts/upload-central-bundle.sh"), "utf8");
const deploymentId = "123e4567-e89b-12d3-a456-426614174000";
const version = "0.3.0";
const expectedPurls = [
  `pkg:maven/com.vireocode/vireo-auth@${version}`,
  `pkg:maven/com.vireocode/vireo-bom@${version}`,
  `pkg:maven/com.vireocode/vireo-bom@${version}?type=pom`,
  `pkg:maven/com.vireocode/vireo-core@${version}`,
  `pkg:maven/com.vireocode/vireo-history@${version}`,
  `pkg:maven/com.vireocode/vireo-offline@${version}`,
  `pkg:maven/com.vireocode/vireo-query@${version}`,
];

function centralStatus({ state, id = deploymentId, purls = expectedPurls }) {
  return JSON.stringify({ deploymentId: id, deploymentState: state, purls });
}

function fixture(statuses, publishHttpStatus = "204") {
  const root = mkdtempSync(join(tmpdir(), "vireo-central-publication-"));
  const bin = join(root, "bin");
  const statusFile = join(root, "statuses.jsonl");
  const curlLog = join(root, "curl.log");
  const curlPath = join(bin, "curl");
  mkdirSync(bin);
  writeFileSync(statusFile, `${statuses.join("\n")}\n`);
  writeFileSync(
    curlPath,
    `#!/usr/bin/env bash
set -euo pipefail
printf '%s\\n' "$*" >> "$MOCK_CENTRAL_CURL_LOG"
if [[ "$*" == *"/status?id="* ]]; then
  response="$(sed -n '1p' "$MOCK_CENTRAL_STATUS_FILE")"
  sed -n '2,$p' "$MOCK_CENTRAL_STATUS_FILE" > "$MOCK_CENTRAL_STATUS_FILE.next"
  mv "$MOCK_CENTRAL_STATUS_FILE.next" "$MOCK_CENTRAL_STATUS_FILE"
  if [[ "$response" == "__TRANSIENT_STATUS_FAILURE__" ]]; then
    echo "transient Central status failure" >&2
    exit 75
  fi
  printf '%s' "$response"
  exit 0
fi
if [[ "$*" == *"/api/v1/publisher/deployment/"* ]]; then
  output_path=""
  for ((index = 1; index <= $#; index += 1)); do
    if [[ "\${!index}" == "--output" ]]; then
      next_index=$((index + 1))
      output_path="\${!next_index}"
      break
    fi
  done
  if [[ -n "$output_path" && -n "\${MOCK_CENTRAL_PUBLISH_BODY:-}" ]]; then
    printf '%s' "$MOCK_CENTRAL_PUBLISH_BODY" > "$output_path"
  fi
  printf '%s' "$MOCK_CENTRAL_PUBLISH_HTTP_STATUS"
  exit 0
fi
echo "unexpected curl request" >&2
exit 98
`,
  );
  chmodSync(curlPath, 0o755);
  return {
    curlLog,
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      MAVEN_CENTRAL_USERNAME: "mock-user",
      MAVEN_CENTRAL_PASSWORD: "mock-password",
      MOCK_CENTRAL_CURL_LOG: curlLog,
      MOCK_CENTRAL_STATUS_FILE: statusFile,
      MOCK_CENTRAL_PUBLISH_HTTP_STATUS: publishHttpStatus,
      CENTRAL_DEPLOYMENT_MAX_ATTEMPTS: "2",
      CENTRAL_DEPLOYMENT_POLL_INTERVAL_SECONDS: "0",
      CENTRAL_STATUS_READ_ATTEMPTS: "2",
      CENTRAL_STATUS_READ_INTERVAL_SECONDS: "0",
      CENTRAL_CONNECT_TIMEOUT_SECONDS: "1",
      CENTRAL_MAX_TIME_SECONDS: "1",
    },
  };
}

function execute(script, args, env) {
  return spawnSync("bash", [script, ...args], { encoding: "utf8", env });
}

function requests(curlLog) {
  return existsSync(curlLog) ? readFileSync(curlLog, "utf8").trim().split("\n") : [];
}

function promotionRequests(curlLog) {
  return requests(curlLog).filter(request => request.includes("/api/v1/publisher/deployment/"));
}

test("publishes only the exact validated deployment through the Central deployment endpoint, then waits for PUBLISHED", () => {
  const mocked = fixture([centralStatus({ state: "VALIDATED" }), centralStatus({ state: "PUBLISHED" })]);
  const result = execute(publishScript, [deploymentId, version], mocked.env);

  assert.equal(expectedPurls.length, 7);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /accepted publication/u);
  assert.match(result.stdout, /already published/u);
  assert.equal(requests(mocked.curlLog).filter(request => request.includes("/status?id=")).length, 2);
  assert.equal(promotionRequests(mocked.curlLog).length, 1);
  assert.match(promotionRequests(mocked.curlLog)[0], new RegExp(`/api/v1/publisher/deployment/${deploymentId}`, "u"));
  assert.doesNotMatch(promotionRequests(mocked.curlLog)[0], /publisher\/publish/u);
});

test("recovers a transient publication preflight status failure without retrying promotion", () => {
  const mocked = fixture([
    "__TRANSIENT_STATUS_FAILURE__",
    centralStatus({ state: "VALIDATED" }),
    centralStatus({ state: "PUBLISHED" }),
  ]);
  const result = execute(publishScript, [deploymentId, version], mocked.env);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /status read failed/u);
  assert.equal(requests(mocked.curlLog).filter(request => request.includes("/status?id=")).length, 3);
  assert.equal(promotionRequests(mocked.curlLog).length, 1);
});

test("bounds exhausted publication preflight status reads before promotion", () => {
  const mocked = fixture(["__TRANSIENT_STATUS_FAILURE__", "__TRANSIENT_STATUS_FAILURE__"]);
  const result = execute(publishScript, [deploymentId, version], mocked.env);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /after 2 attempt\(s\)/u);
  assert.equal(requests(mocked.curlLog).filter(request => request.includes("/status?id=")).length, 2);
  assert.equal(promotionRequests(mocked.curlLog).length, 0);
});

test("rejects a noncanonical deployment UUID or unsafe Maven version before Central calls", () => {
  for (const [candidateId, candidateVersion] of [
    ["123e4567-e89b-12d3-a456-42661417400", version],
    [deploymentId, "0.3.0-SNAPSHOT"],
    [deploymentId, "0.3.0 release"],
  ]) {
    const mocked = fixture([centralStatus({ state: "VALIDATED" })]);
    const result = execute(publishScript, [candidateId, candidateVersion], mocked.env);
    assert.notEqual(result.status, 0);
    assert.equal(requests(mocked.curlLog).length, 0);
  }
});

test("requires the complete seven-PURL BOM set and rejects qualifier, extra, missing, and version drift", () => {
  const purlCases = [
    ["missing bare BOM PURL", expectedPurls.filter(purl => purl !== `pkg:maven/com.vireocode/vireo-bom@${version}`)],
    [
      "missing BOM POM PURL",
      expectedPurls.filter(purl => purl !== `pkg:maven/com.vireocode/vireo-bom@${version}?type=pom`),
    ],
    ["wrong BOM qualifier", expectedPurls.map(purl => purl.replace("?type=pom", "?type=jar"))],
    [
      "jar qualifier",
      expectedPurls.map(purl => purl.replace(`vireo-auth@${version}`, `vireo-auth@${version}?type=jar`)),
    ],
    ["missing", expectedPurls.slice(1)],
    ["extra", [...expectedPurls, `pkg:maven/com.vireocode/vireo-unexpected@${version}`]],
    ["wrong version", expectedPurls.map(purl => purl.replace(`@${version}`, "@0.3.1"))],
  ];
  for (const [name, purls] of purlCases) {
    const mocked = fixture([centralStatus({ state: "VALIDATED", purls })]);
    const result = execute(publishScript, [deploymentId, version], mocked.env);
    assert.notEqual(result.status, 0, name);
    assert.match(result.stderr, /do not exactly match/u);
    assert.ok(result.stderr.includes(`Expected PURLs: ${JSON.stringify([...expectedPurls].sort())}`));
    assert.ok(result.stderr.includes(`Actual PURLs: ${JSON.stringify([...purls].sort())}`));
    assert.equal(promotionRequests(mocked.curlLog).length, 0, name);
  }
});

test("fails closed before promotion for a mismatched deployment UUID or non-VALIDATED state", () => {
  for (const status of [
    centralStatus({ state: "VALIDATED", id: "123e4567-e89b-12d3-a456-426614174001" }),
    centralStatus({ state: "PENDING" }),
  ]) {
    const mocked = fixture([status]);
    const result = execute(publishScript, [deploymentId, version], mocked.env);
    assert.notEqual(result.status, 0);
    assert.equal(promotionRequests(mocked.curlLog).length, 0);
  }
});

test("strict public-state recovery requires the exact deployment already PUBLISHED and never posts", () => {
  for (const [state, expectedStatus] of [
    ["VALIDATED", 1],
    ["PUBLISHED", 0],
  ]) {
    const mocked = fixture([centralStatus({ state })]);
    const result = execute(publishScript, [deploymentId, version, "--require-published"], mocked.env);
    assert.equal(result.status, expectedStatus, `${state}: ${result.stderr}`);
    assert.equal(promotionRequests(mocked.curlLog).length, 0, state);
  }
});

test("fails closed when the Central promotion response is not exactly HTTP 204", () => {
  const mocked = fixture([centralStatus({ state: "VALIDATED" })], "202");
  const result = execute(publishScript, [deploymentId, version], mocked.env);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /HTTP 202; expected exactly 204/u);
  assert.equal(promotionRequests(mocked.curlLog).length, 1);
});

test("waiter recovers a transient status read before PUBLISHING and PUBLISHED", () => {
  const mocked = fixture([
    "__TRANSIENT_STATUS_FAILURE__",
    centralStatus({ state: "PUBLISHING" }),
    centralStatus({ state: "PUBLISHED" }),
  ]);
  const result = execute(waitScript, [deploymentId, "PUBLISHED"], mocked.env);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /status read failed/u);
  assert.match(result.stdout, /PUBLISHING/u);
  assert.match(result.stdout, /already published/u);
});

test("waiter bounds exhausted status-read failures", () => {
  const mocked = fixture(["__TRANSIENT_STATUS_FAILURE__", "__TRANSIENT_STATUS_FAILURE__"]);
  const result = execute(waitScript, [deploymentId, "PUBLISHED"], mocked.env);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /after 2 attempt\(s\)/u);
  assert.equal(requests(mocked.curlLog).filter(request => request.includes("/status?id=")).length, 2);
});

test("waiter rejects FAILED, unknown, and mismatched deployment-ID responses", () => {
  for (const status of [
    centralStatus({ state: "FAILED" }),
    centralStatus({ state: "UNEXPECTED" }),
    centralStatus({ state: "PUBLISHED", id: "123e4567-e89b-12d3-a456-426614174001" }),
  ]) {
    const mocked = fixture([status]);
    const result = execute(waitScript, [deploymentId, "PUBLISHED"], mocked.env);
    assert.notEqual(result.status, 0);
  }
});

test("combined ecosystem workflow keeps USER_MANAGED automatic promotion and receipt recovery", () => {
  assert.doesNotMatch(workflow, /workflow_dispatch:/u);
  assert.match(workflow, /needs\.plan\.outputs\.action == 'jvm-only'/u);
  assert.match(workflow, /environment: maven-central/u);
  assert.match(workflow, /actions: read\n\s+contents: read/u);
  assert.match(workflow, /Prior upload intent has no accepted receipt/u);
  assert.match(workflow, /node \.\.\/scripts\/release-run-artifacts\.mjs/u);
  assert.match(workflow, /needs\.maven-state\.outputs\.visibility \}\}" = absent/u);
  assert.match(workflow, /maven-central-receipt-\$\{\{ github\.run_id \}\}/u);
  assert.match(workflow, /publish-central-deployment\.sh "\$DEPLOYMENT_ID" "\$VERSION"/u);
  assert.match(workflow, /--require-published/u);
  assert.match(workflow, /receipt-path=\$receipt/u);
  assert.match(workflow, /steps\.prior\.outputs\.attempt \|\| github\.run_attempt/u);
  assert.match(workflow, /wait-central-validation\.sh "\$DEPLOYMENT_ID" PUBLISHED/u);
  assert.match(recoveryWorkflow, /if \[ "\$\{\{ steps\.central-state\.outputs\.visibility \}\}" = absent \]; then/u);
  assert.ok(
    workflow.indexOf("Wait for exact Central validation before recording a promotion attempt") <
      workflow.indexOf("Persist exact Central promotion-attempt evidence before the irreversible request") &&
      workflow.indexOf("Persist exact Central promotion-attempt evidence before the irreversible request") <
        workflow.indexOf("Validate then publish exact Central deployment once"),
  );
  assert.ok(workflow.indexOf("wait-central-validation.sh") < workflow.indexOf("publish-central-deployment.sh"));
  assert.match(uploadScript, /publishingType=USER_MANAGED/u);
  assert.doesNotMatch(workflow, /publishingType=AUTOMATIC/u);
  assert.match(workflow, /finalize-jvm/u);
  assert.match(workflow, /exact-binding: \$\{\{ steps\.binding\.outputs\.exact-binding \}\}/u);
  assert.match(workflow, /VISIBILITY: \$\{\{ needs\.maven-state\.outputs\.visibility \}\}/u);
  assert.match(workflow, /RECEIPT: \$\{\{ steps\.prior\.outputs\.recovered \}\}/u);
  assert.match(workflow, /needs\.maven\.outputs\.exact-binding/u);
});

test("anonymous public Maven verification cannot request the protected publication environment", () => {
  assert.doesNotMatch(verifyWorkflow, /environment: maven-central/u);
  assert.match(verifyWorkflow, /permissions:\n\s+contents: read/u);
  assert.match(verifyWorkflow, /VERSION: \$\{\{ inputs\.version \}\}/u);
  assert.ok(verifyWorkflow.includes("grep -Eq '^[0-9]+\\.[0-9]+\\.[0-9]+(-[0-9A-Za-z.-]+)?$'"));
  assert.match(verifyWorkflow, /verify-central-consumer\.sh "\$VERSION"/u);
  assert.doesNotMatch(verifyWorkflow, /run: .*\$\{\{ inputs\.version \}\}/u);
  assert.doesNotMatch(verifyWorkflow, /- name: Summarize Maven publication verification\n\s+if: always\(\)/u);
});

test("manual Maven verification rejects multiline version input before shell use", () => {
  assert.match(verifyWorkflow, /case "\$VERSION" in\n\s+\*\$'\\n'\*\|\*\$'\\r'\*\)/u);
  const validation = spawnSync(
    "bash",
    [
      "-c",
      "case \"$VERSION\" in *$'\\n'*|*$'\\r'*) exit 1;; esac; printf '%s' \"$VERSION\" | grep -Eq '^[0-9]+\\.[0-9]+\\.[0-9]+(-[0-9A-Za-z.-]+)?$'",
    ],
    { env: { ...process.env, VERSION: "0.3.1\nmalicious" } },
  );
  assert.notEqual(validation.status, 0);
});

test("recovery workflow binds one deployment to an exact release commit and completes no-secret finalization", () => {
  assert.match(recoveryWorkflow, /^name: Recovery · Maven Central deployment$/mu);
  assert.match(recoveryWorkflow, /workflow_dispatch:\n\s+inputs:\n\s+version:/u);
  assert.match(recoveryWorkflow, /source_commit:/u);
  assert.match(recoveryWorkflow, /source_run_id:/u);
  assert.match(recoveryWorkflow, /deployment_id:/u);
  assert.match(recoveryWorkflow, /confirmation:/u);
  assert.match(recoveryWorkflow, /if: github\.ref == 'refs\/heads\/main'/u);
  assert.match(recoveryWorkflow, /group: vireo-ecosystem-public-release/u);
  assert.match(workflow, /group: vireo-ecosystem-public-release-\$\{\{ github\.sha \}\}/u);
  assert.match(recoveryWorkflow, /group: vireo-ecosystem-public-release-\$\{\{ inputs\.source_commit \}\}/u);
  assert.doesNotMatch(recoveryWorkflow, /maven-central-recovery-|group: vireo-ecosystem-public-release\s*$/mu);
  assert.match(recoveryWorkflow, /cancel-in-progress: false/u);
  assert.match(recoveryWorkflow, /environment: maven-central/u);
  assert.match(recoveryWorkflow, /permissions:\n\s+contents: read/u);
  assert.match(recoveryWorkflow, /PUBLISH_VALIDATED_DEPLOYMENT/u);
  assert.match(
    recoveryWorkflow,
    /for module in vireo-bom vireo-core vireo-auth vireo-query vireo-offline vireo-history/u,
  );
  assert.match(recoveryWorkflow, /classifyCentralVisibility/u);
  assert.match(recoveryWorkflow, /echo "visibility=\$visibility"/u);
  assert.match(recoveryWorkflow, /--require-published/u);
  assert.match(recoveryWorkflow, /node scripts\/ecosystem-publication-plan\.mjs/u);
  assert.match(recoveryWorkflow, /node scripts\/maven-recovery-source-run\.mjs/u);
  assert.match(recoveryWorkflow, /node scripts\/release-run-artifacts\.mjs/u);
  assert.match(recoveryWorkflow, /retain exactly one signed Maven upload intent/u);
  assert.match(recoveryWorkflow, /accepted receipt deployment UUID does not match the requested recovery deployment/u);
  assert.match(recoveryWorkflow, /more than one accepted Central receipt/u);
  assert.match(recoveryWorkflow, /exactly one signed bundle and intent record/u);
  assert.match(recoveryWorkflow, /validateBundleReceipt/u);
  assert.match(recoveryWorkflow, /git merge-base --is-ancestor "\$SOURCE_COMMIT" origin\/main/u);
  assert.match(recoveryWorkflow, /pull-requests: read/u);
  assert.match(recoveryWorkflow, /actions: read/u);
  assert.match(recoveryWorkflow, /needs: recover/u);
  assert.match(recoveryWorkflow, /contents: write/u);
  assert.match(recoveryWorkflow, /verify-central-consumer\.sh/u);
  assert.match(recoveryWorkflow, /finalize-jvm-release\.mjs "\$VERSION" "\$SOURCE_COMMIT"/u);
  assert.match(recoveryWorkflow, /name: Resume exact interrupted ecosystem release run/u);
  assert.match(recoveryWorkflow, /actions: write/u);
  assert.match(recoveryWorkflow, /actions\/runs\/\$SOURCE_RUN_ID\/rerun/u);
  assert.match(recoveryWorkflow, /completed:failure\|completed:cancelled\|completed:timed_out/u);
  assert.match(recoveryWorkflow, /publish-central-deployment\.sh "\$DEPLOYMENT_ID" "\$REQUESTED_VERSION"/u);
  assert.equal(recoveryWorkflow.match(/publish-central-deployment\.sh/gu)?.length, 2);
  assert.doesNotMatch(recoveryWorkflow, /build-central-bundle\.sh|upload-central-bundle\.sh|publishMavenPublication/u);
  assert.match(recoveryWorkflow, /Publication identity: \\`6 artifacts \/ 7 exact PURLs\\`/u);

  const inputInterpolationLines = recoveryWorkflow.split("\n").filter(line => line.includes("${{ inputs."));
  assert.ok(inputInterpolationLines.includes("          SOURCE_COMMIT: ${{ inputs.source_commit }}"));
  assert.ok(inputInterpolationLines.includes("          SOURCE_RUN_ID: ${{ inputs.source_run_id }}"));
  assert.ok(inputInterpolationLines.includes("          DEPLOYMENT_ID: ${{ inputs.deployment_id }}"));
});

test("status reads have bounded retries and timeouts while the irreversible publication request is a single timed call", () => {
  for (const script of [publishScriptSource, waitScriptSource]) {
    assert.match(script, /CENTRAL_STATUS_READ_ATTEMPTS/u);
    assert.match(script, /--connect-timeout "\$connect_timeout_seconds"/u);
    assert.match(script, /--max-time "\$max_time_seconds"/u);
  }
  const publicationRequest = publishScriptSource.slice(publishScriptSource.indexOf('http_status="$('));
  assert.match(publicationRequest, /--connect-timeout "\$connect_timeout_seconds"/u);
  assert.match(publicationRequest, /--max-time "\$max_time_seconds"/u);
  assert.doesNotMatch(publicationRequest, /--retry|for \(\(/u);
});
