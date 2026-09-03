import { createHash } from "node:crypto";

export const expectedMavenPurls = version =>
  [
    `pkg:maven/com.vireocode/vireo-auth@${version}`,
    `pkg:maven/com.vireocode/vireo-bom@${version}`,
    `pkg:maven/com.vireocode/vireo-bom@${version}?type=pom`,
    `pkg:maven/com.vireocode/vireo-core@${version}`,
    `pkg:maven/com.vireocode/vireo-history@${version}`,
    `pkg:maven/com.vireocode/vireo-offline@${version}`,
    `pkg:maven/com.vireocode/vireo-query@${version}`,
  ].sort();

export function bundleReceipt({ version, sha, runId, runAttempt, bundle }) {
  if (!/^\d+$/u.test(String(runId)) || !/^\d+$/u.test(String(runAttempt)) || !/^[a-f0-9]{40}$/u.test(sha))
    throw new Error("Maven receipt must bind an exact GitHub run, attempt, and release SHA.");
  if (!/^[a-f0-9]{64}$/u.test(bundle)) throw new Error("Maven receipt must bind a SHA-256 signed bundle.");
  return {
    schemaVersion: 1,
    version,
    sha,
    runId: String(runId),
    runAttempt: String(runAttempt),
    bundle,
    purls: expectedMavenPurls(version),
  };
}
export function validateBundleReceipt(receipt, expected) {
  const canonical = bundleReceipt(expected);
  if (
    receipt?.schemaVersion !== canonical.schemaVersion ||
    receipt.version !== canonical.version ||
    receipt.sha !== canonical.sha ||
    receipt.runId !== canonical.runId ||
    receipt.runAttempt !== canonical.runAttempt ||
    receipt.bundle !== canonical.bundle ||
    JSON.stringify([...(receipt.purls ?? [])].sort()) !== JSON.stringify(canonical.purls)
  )
    throw new Error("Maven upload intent does not exactly bind the expected release transaction.");
  return canonical;
}
export function classifyCentralVisibility(statuses) {
  if (!Array.isArray(statuses) || statuses.length !== 6)
    throw new Error("Expected exactly six Maven artifact visibility states.");
  if (statuses.every(status => status === 404)) return "absent";
  if (statuses.every(status => status === 200)) return "public";
  if (statuses.some(status => ![200, 404].includes(status)))
    throw new Error("Maven Central returned an unexpected visibility status.");
  throw new Error("Maven Central artifact visibility is partial; refusing ambiguous release recovery.");
}
export function finalizeReceipt(intent, deploymentId) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu.test(deploymentId ?? ""))
    throw new Error("Central deployment receipt requires an exact UUID.");
  return { ...intent, deploymentId: deploymentId.toLowerCase() };
}
export function receiptDigest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
