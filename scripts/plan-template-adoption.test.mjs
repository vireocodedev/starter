import assert from "node:assert/strict";
import test from "node:test";

import { fetchBoundTemplateFile } from "./plan-template-adoption.mjs";

function chunkedResponse(bytes) {
  return {
    ok: true,
    status: 200,
    headers: new Headers(),
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    }),
  };
}

test("bound Template files use raw media and accept a lockfile-sized streamed response", async () => {
  const bytes = new Uint8Array(487_757);
  let options;
  const received = await fetchBoundTemplateFile({
    templateRepository: "vireocodedev/vireo-template",
    commit: "a".repeat(40),
    path: "frontend/package-lock.json",
    fetchResponse: async (_url, request) => {
      options = request;
      return chunkedResponse(bytes);
    },
  });
  assert.equal(received.length, bytes.length);
  assert.equal(options.headers.Accept, "application/vnd.github.raw");
  assert.equal(options.headers.Authorization, undefined);
  assert.equal(options.redirect, "error");
});

test("bound Template files reject streamed raw responses above their deliberate cap", async () => {
  await assert.rejects(
    fetchBoundTemplateFile({
      templateRepository: "vireocodedev/vireo-template",
      commit: "a".repeat(40),
      path: "frontend/package-lock.json",
      maximum: 4,
      fetchResponse: async () => chunkedResponse(new Uint8Array(5)),
    }),
    /bounded response size/u,
  );
});
