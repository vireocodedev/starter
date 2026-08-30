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
const workflow = readFileSync(join(repositoryRoot, ".github/workflows/release-maven-central.yml"), "utf8");
const recoveryWorkflow = readFileSync(
  join(repositoryRoot, ".github/workflows/recover-maven-central-deployment.yml"),
  "utf8",
);
const uploadScript = readFileSync(join(repositoryRoot, "jvm/scripts/upload-central-bundle.sh"), "utf8");
const deploymentId = "123e4567-e89b-12d3-a456-426614174000";
const version = "0.3.0";
const expectedPurls = [
  `pkg:maven/com.vireocode/vireo-auth@${version}`,
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

test("fails closed before promotion for missing or wrong BOM qualifiers, jar qualifiers, extra, missing, or wrong-version Central package URLs", () => {
  const purlCases = [
    ["missing BOM qualifier", expectedPurls.map(purl => purl.replace("?type=pom", ""))],
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

test("release workflow keeps USER_MANAGED upload defaulting to explicit protected publication after validation", () => {
  assert.match(
    workflow,
    /publish:\n\s+description: Publish the validated deployment to Maven Central \(defaults to staging only\)\n\s+required: false\n\s+default: false\n\s+type: boolean/u,
  );
  assert.match(workflow, /if: github\.ref == 'refs\/heads\/main'/u);
  assert.match(workflow, /environment: maven-central/u);
  assert.match(workflow, /permissions:\n\s+contents: read/u);
  assert.match(workflow, /timeout-minutes: 65/u);
  assert.match(workflow, /if: inputs\.publish/u);
  assert.match(
    workflow,
    /publish-central-deployment\.sh "\$\{\{ steps\.central\.outputs\.deployment-id \}\}" "\$\{\{ steps\.bundle\.outputs\.version \}\}"/u,
  );
  assert.ok(workflow.indexOf("wait-central-validation.sh") < workflow.indexOf("if: inputs.publish"));
  assert.match(uploadScript, /publishingType=USER_MANAGED/u);
  assert.doesNotMatch(workflow, /publishingType=AUTOMATIC/u);
  assert.doesNotMatch(uploadScript, /publishingType=AUTOMATIC/u);
});

test("recovery workflow promotes one existing validated deployment without building or uploading another bundle", () => {
  assert.match(recoveryWorkflow, /^name: Recover validated Maven Central deployment$/mu);
  assert.match(recoveryWorkflow, /workflow_dispatch:\n\s+inputs:\n\s+version:/u);
  assert.match(recoveryWorkflow, /deployment_id:/u);
  assert.match(recoveryWorkflow, /confirmation:/u);
  assert.match(recoveryWorkflow, /if: github\.ref == 'refs\/heads\/main'/u);
  assert.match(recoveryWorkflow, /environment: maven-central/u);
  assert.match(recoveryWorkflow, /permissions:\n\s+contents: read/u);
  assert.match(recoveryWorkflow, /PUBLISH_VALIDATED_DEPLOYMENT/u);
  assert.match(recoveryWorkflow, /case "\$status" in\n\s+404\)/u);
  assert.match(
    recoveryWorkflow,
    /DEPLOYMENT_ID: \$\{\{ inputs\.deployment_id \}\}\n\s+REQUESTED_VERSION: \$\{\{ inputs\.version \}\}/u,
  );
  assert.match(recoveryWorkflow, /publish-central-deployment\.sh "\$DEPLOYMENT_ID" "\$REQUESTED_VERSION"/u);
  assert.equal(recoveryWorkflow.match(/publish-central-deployment\.sh/gu)?.length, 1);
  assert.doesNotMatch(recoveryWorkflow, /build-central-bundle\.sh|upload-central-bundle\.sh|publishMavenPublication/u);

  const inputInterpolationLines = recoveryWorkflow.split("\n").filter(line => line.includes("${{ inputs."));
  assert.deepEqual(inputInterpolationLines, [
    "  group: maven-central-recovery-${{ inputs.deployment_id }}",
    "    name: Recover ${{ inputs.version }} from ${{ inputs.deployment_id }}",
    "          CONFIRMATION: ${{ inputs.confirmation }}",
    "          REQUESTED_VERSION: ${{ inputs.version }}",
    "          DEPLOYMENT_ID: ${{ inputs.deployment_id }}",
    "          REQUESTED_VERSION: ${{ inputs.version }}",
    "          VERSION: ${{ inputs.version }}",
    "          DEPLOYMENT_ID: ${{ inputs.deployment_id }}",
  ]);
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
