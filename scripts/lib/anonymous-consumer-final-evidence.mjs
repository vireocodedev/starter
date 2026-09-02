const sha256 = /^[0-9a-f]{64}$/u;
export function validateFinalAnonymousEvidence(evidence, release, policy) {
  const problems = [];
  if (evidence.status !== "passed") problems.push("final evidence is not passed");
  for (const key of ["verifierSourceCommit", "requestedReleaseId", "workflow"])
    if (!evidence[key]) problems.push(`missing ${key}`);
  if (evidence.requestedReleaseId !== release.id) problems.push("requested release id drifted");
  if (evidence.release?.template?.commit !== release.template.commit) problems.push("Template coordinate drifted");
  if (!/^[0-9a-f]{40}$/u.test(evidence.releaseTagCommit ?? "")) problems.push("missing release tag commit");
  if (policy) {
    const expectedScenarios = new Map((policy.scenarios ?? []).map(scenario => [scenario.id, scenario]));
    const requiredScenarios = policy.requiredScenarios ?? [];
    const actualScenarios = evidence.scenarios ?? [];
    if (
      JSON.stringify(actualScenarios.map(scenario => scenario.id).sort()) !==
      JSON.stringify([...requiredScenarios].sort())
    )
      problems.push("scenario coverage is incomplete or duplicate");
    for (const scenario of actualScenarios) {
      const expected = expectedScenarios.get(scenario.id);
      if (!expected || JSON.stringify(scenario.recipe) !== JSON.stringify(expected.recipe))
        problems.push(`${scenario.id} recipe does not match policy`);
      if (scenario.status !== "passed") problems.push(`${scenario.id} is not passed`);
      if (!Array.isArray(scenario.commands) || scenario.commands.length === 0)
        problems.push(`${scenario.id} has no operations`);
    }
  }
  if ((evidence.findings ?? []).length > 0) problems.push("passed evidence may not retain machine-actionable findings");
  if (JSON.stringify(evidence).match(/(?:token|password|secret|authorization)"\s*:/iu))
    problems.push("evidence contains a secret-shaped field");
  for (const scenario of evidence.scenarios ?? [])
    for (const operation of scenario.commands ?? []) {
      if (operation.status !== "passed") problems.push(`${scenario.id}/${operation.id} is not passed`);
      for (const stream of [operation.stdout, operation.stderr])
        if (!stream || !sha256.test(stream.sha256 ?? "") || !Number.isSafeInteger(stream.bytes) || stream.bytes < 0)
          problems.push(`${scenario.id}/${operation.id} lacks a valid digest`);
    }
  for (const warning of evidence.externalWarnings ?? [])
    if (
      warning.version !== "0.8.1" ||
      warning.owner !== "provider" ||
      warning.category !== "external-warning" ||
      typeof warning.reason !== "string"
    )
      problems.push("external warning is not allowlisted");
  return problems;
}
