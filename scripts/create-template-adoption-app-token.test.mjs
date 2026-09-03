import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";
import { createAppJwt } from "./create-template-adoption-app-token.mjs";

test("creates a bounded RS256 GitHub App JWT without exposing its key", () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const jwt = createAppJwt({
    appId: "123",
    privateKey: privateKey.export({ type: "pkcs1", format: "pem" }),
    now: 1_700_000_000_000,
  });
  assert.match(jwt, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/u);
});
