const historicalTemplateReleaseWarning = Object.freeze({
  version: "0.8.1",
  reason: "GitHub Release immutability was enabled after this exact historical release.",
});

export function validateReleasePreflightIdentity({ release, requestedReleaseId, requestedSourceCommit }) {
  const problems = [];
  if (requestedReleaseId && requestedReleaseId !== release.id) problems.push("requested release id does not match ecosystem current release");
  if (requestedSourceCommit && requestedSourceCommit !== release.template.commit) problems.push("requested source commit does not match the exact Template commit");
  if (!/^npm-\d+\.\d+\.\d+_jvm-\d+\.\d+\.\d+$/u.test(release.id)) problems.push("release id is not exact");
  if (!/^[0-9a-f]{40}$/u.test(release.template.commit)) problems.push("Template commit is not immutable");
  return problems;
}

export function templateReleaseImmutabilityFinding({ version, immutable }) {
  if (immutable) return null;
  if (version === historicalTemplateReleaseWarning.version)
    return { category: "external-warning", owner: "provider", ...historicalTemplateReleaseWarning };
  throw new Error(`Template GitHub Release ${version} must be immutable.`);
}
