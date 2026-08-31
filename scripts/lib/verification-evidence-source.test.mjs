import assert from "node:assert/strict";
import test from "node:test";
import { resolveVerificationEvidenceSource } from "./verification-evidence-source.mjs";

const command =
  ({ head = "abc", status = "" } = {}) =>
  (_name, args) =>
    args[0] === "rev-parse" ? head : status;

test("resolves clean local evidence source", () => {
  const { source, problems } = resolveVerificationEvidenceSource({ command: command() });
  assert.deepEqual(problems, []);
  assert.deepEqual(source, {
    head: "abc",
    commit: "abc",
    workflow: "local",
    runId: null,
    runAttempt: null,
    clean: true,
    authoritative: false,
  });
});

test("marks dirty local evidence non-authoritative", () => {
  const { source } = resolveVerificationEvidenceSource({ command: command({ status: "?? scratch.txt\n" }) });
  assert.equal(source.clean, false);
  assert.equal(source.authoritative, false);
});

test("records hosted mismatch as a policy problem", () => {
  const { source, problems } = resolveVerificationEvidenceSource({
    command: command(),
    env: {
      GITHUB_ACTIONS: "true",
      GITHUB_SHA: "def",
      GITHUB_WORKFLOW: "verify",
      GITHUB_RUN_ID: "1",
      GITHUB_RUN_ATTEMPT: "2",
    },
  });
  assert.equal(source.clean, true);
  assert.equal(source.authoritative, false);
  assert.match(problems.join("\n"), /does not match/u);
});

test("marks clean matching hosted evidence authoritative", () => {
  assert.equal(
    resolveVerificationEvidenceSource({ command: command(), env: { GITHUB_ACTIONS: "true", GITHUB_SHA: "abc" } }).source
      .authoritative,
    true,
  );
});

test("requires an explicit nonblank hosted selected SHA", () => {
  for (const sha of [undefined, "   "]) {
    const resolved = resolveVerificationEvidenceSource({
      command: command(),
      env: { GITHUB_ACTIONS: "true", ...(sha === undefined ? {} : { GITHUB_SHA: sha }) },
    });
    assert.equal(resolved.source.authoritative, false);
    assert.match(resolved.problems.join("\n"), /nonblank GITHUB_SHA/u);
  }
});

test("fails actionably when Git source is unavailable or HEAD is empty", () => {
  const gitFailure = new Error("not a repository");
  assert.throws(
    () =>
      resolveVerificationEvidenceSource({
        command: () => {
          throw gitFailure;
        },
      }),
    error => /Could not determine Git verification evidence source/u.test(error.message) && error.cause === gitFailure,
  );
  assert.throws(() => resolveVerificationEvidenceSource({ command: command({ head: "" }) }), /HEAD is empty/u);
});
