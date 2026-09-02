const sha256 = /^[0-9a-f]{64}$/u;
export function validateFinalAnonymousEvidence(evidence, release) {
  const problems = [];
  if (evidence.status !== "passed") problems.push("final evidence is not passed");
  for (const key of ["verifierSourceCommit", "requestedReleaseId", "workflow"]) if (!evidence[key]) problems.push(`missing ${key}`);
  if (evidence.requestedReleaseId !== release.id) problems.push("requested release id drifted");
  if (evidence.release?.template?.commit !== release.template.commit) problems.push("Template coordinate drifted");
  for (const scenario of evidence.scenarios ?? []) for (const operation of scenario.commands ?? []) {
    if (operation.status !== "passed") problems.push(`${scenario.id}/${operation.id} is not passed`);
    for (const stream of [operation.stdout, operation.stderr]) if (!stream || !sha256.test(stream.sha256 ?? "")) problems.push(`${scenario.id}/${operation.id} lacks a valid digest`);
  }
  for (const warning of evidence.externalWarnings ?? []) if (warning.version !== "0.8.1" || warning.owner !== "provider") problems.push("external warning is not allowlisted");
  return problems;
}
