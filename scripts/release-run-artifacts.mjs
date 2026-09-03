export function classifyReleaseRunArtifacts(payload, runId) {
  if (!/^\d+$/u.test(String(runId))) throw new Error("Release run id must be an exact decimal identifier.");
  if (
    !Number.isInteger(payload?.total_count) ||
    !Array.isArray(payload?.artifacts) ||
    payload.total_count !== payload.artifacts.length
  )
    throw new Error("Release-run artifact response is incomplete or malformed.");
  const select = kind =>
    payload.artifacts.filter(artifact => {
      if (!Number.isSafeInteger(artifact?.id) || artifact.id <= 0 || typeof artifact.name !== "string")
        throw new Error("Release-run artifact response contains an invalid artifact identity.");
      return new RegExp(`^maven-central-${kind}-${runId}-[1-9]\\d*$`, "u").test(artifact.name);
    });
  return { intents: select("intent"), receipts: select("receipt"), promotionAttempts: select("promotion-attempt") };
}

if (process.argv[1]?.endsWith("release-run-artifacts.mjs")) {
  if (!process.env.ARTIFACTS_JSON) throw new Error("ARTIFACTS_JSON is required.");
  console.log(
    JSON.stringify(classifyReleaseRunArtifacts(JSON.parse(process.env.ARTIFACTS_JSON), process.env.RELEASE_RUN_ID)),
  );
}
