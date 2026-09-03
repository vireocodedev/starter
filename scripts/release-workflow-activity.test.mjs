import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyCombinedReleaseJobs,
  jvmFinalizationJob,
  loadParentRunActivity,
  npmPublicationJob,
} from "./release-workflow-activity.mjs";

const job = (name, conclusion, run_attempt = 1) => ({ name, conclusion, run_attempt });
const complete = (npm = "skipped", jvm = "skipped") => [job(npmPublicationJob, npm), job(jvmFinalizationJob, jvm)];

test("classifies only exact successful publication/finalization jobs as release activity", () => {
  assert.deepEqual(classifyCombinedReleaseJobs(complete("success", "skipped")), {
    npmActive: true,
    jvmActive: false,
    anyActivity: true,
  });
  assert.deepEqual(classifyCombinedReleaseJobs(complete("skipped", "success")), {
    npmActive: false,
    jvmActive: true,
    anyActivity: true,
  });
  assert.deepEqual(classifyCombinedReleaseJobs(complete()), { npmActive: false, jvmActive: false, anyActivity: false });
});

test("fails closed for missing, duplicate, and unknown release job conclusions", () => {
  assert.throws(() => classifyCombinedReleaseJobs([job(npmPublicationJob, "success")]), /exactly one/u);
  assert.throws(
    () => classifyCombinedReleaseJobs([...complete(), job(npmPublicationJob, "success")]),
    /duplicate latest/u,
  );
  assert.throws(() => classifyCombinedReleaseJobs(complete("queued", "skipped")), /unknown or incomplete/u);
});

test("uses the unique latest job attempt so partial reruns retain prior successful release activity", () => {
  assert.deepEqual(
    classifyCombinedReleaseJobs([
      job(npmPublicationJob, "failure", 1),
      job(jvmFinalizationJob, "success", 1),
      job(npmPublicationJob, "success", 2),
    ]),
    { npmActive: true, jvmActive: true, anyActivity: true },
  );
  assert.throws(
    () =>
      classifyCombinedReleaseJobs([
        job(npmPublicationJob, "success", 1),
        job(npmPublicationJob, "success", 1),
        job(jvmFinalizationJob, "skipped", 1),
      ]),
    /duplicate latest/u,
  );
});

test("requires a complete authoritative parent jobs response", async () => {
  const response = { ok: true, json: async () => ({ total_count: 3, jobs: complete("success", "skipped") }) };
  await assert.rejects(
    () =>
      loadParentRunActivity(async () => response, { repository: "vireocodedev/vireo", runId: "123", token: "token" }),
    /incomplete or malformed/u,
  );
});
