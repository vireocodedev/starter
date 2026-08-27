import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { retryTransientNpmRegistryOperation } from "./npm-registry-retry.mjs";

describe("npm registry propagation retry", () => {
  it("retries transient registry 404s", async () => {
    let calls = 0;
    const retries = [];
    const result = await retryTransientNpmRegistryOperation(
      () => {
        calls += 1;
        if (calls < 3) throw Object.assign(new Error("install failed"), { stderr: "npm error code E404" });
        return "installed";
      },
      {
        attempts: 4,
        intervalMs: 1,
        onRetry: (_error, attempt) => retries.push(attempt),
        sleep: () => {},
      },
    );

    assert.equal(result, "installed");
    assert.equal(calls, 3);
    assert.deepEqual(retries, [1, 2]);
  });

  it("does not retry non-registry failures", async () => {
    let calls = 0;
    await assert.rejects(
      retryTransientNpmRegistryOperation(
        () => {
          calls += 1;
          throw Object.assign(new Error("peer dependency failure"), { stderr: "npm error code ERESOLVE" });
        },
        { attempts: 4, intervalMs: 1, sleep: () => {} },
      ),
      /peer dependency failure/u,
    );
    assert.equal(calls, 1);
  });

  it("surfaces the final 404 after the retry budget is exhausted", async () => {
    let calls = 0;
    await assert.rejects(
      retryTransientNpmRegistryOperation(
        () => {
          calls += 1;
          throw Object.assign(new Error("still missing"), { stderr: "404 Not Found" });
        },
        { attempts: 2, intervalMs: 1, sleep: () => {} },
      ),
      /still missing/u,
    );
    assert.equal(calls, 2);
  });
});
