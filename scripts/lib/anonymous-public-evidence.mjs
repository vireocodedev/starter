export function validateAnonymousPublicEvidence({ manifest, release }) {
  const problems = [];
  const npm = manifest?.versions?.npm ?? {};
  for (const entry of release.npm) if (npm[entry.name] !== entry.version) problems.push(`npm evidence must contain ${entry.name}@${entry.version}`);
  if (manifest?.versions?.maven?.group !== release.maven.group || manifest?.versions?.maven?.version !== release.maven.version)
    problems.push("Maven evidence must match the exact ecosystem coordinate");
  const npmSubjects = manifest?.subjects?.filter(subject => subject.ecosystem === "npm") ?? [];
  for (const entry of release.npm) {
    const subject = npmSubjects.find(candidate => candidate.name === entry.name && candidate.version === entry.version);
    if (!subject || !/^[0-9a-f]{64}$/u.test(subject.sha256 ?? "")) problems.push(`missing immutable npm subject digest for ${entry.name}`);
  }
  for (const module of release.maven.modules) {
    if (!(manifest?.subjects ?? []).some(subject => subject.coordinate === `${release.maven.group}:${module}:${release.maven.version}`))
      problems.push(`missing immutable Maven subject for ${module}`);
  }
  return problems;
}

export function validateExactNpmRecord({ record, expected, releaseTagCommit }) {
  const problems = [];
  if (record?.name !== expected.name || record?.version !== expected.version) problems.push("package identity/version mismatch");
  if (!/^sha512-/u.test(record?.integrity ?? "")) problems.push("registry integrity must be SHA-512");
  if (!/^[0-9a-f]{64}$/u.test(record?.sha256 ?? "")) problems.push("packed subject digest is invalid");
  if (record?.repository !== "https://github.com/vireocodedev/vireo") problems.push("package repository is not canonical");
  if (!record?.license || record.license !== "MIT" || record.licenseFile !== "LICENSE") problems.push("package license metadata/file mismatch");
  if (!record?.inventorySafe || !record?.exportsSafe || !record?.binSafe) problems.push("package inventory or public targets are unsafe");
  const provenance = record?.provenance;
  if (provenance?.repository !== "vireocodedev/vireo" || provenance?.workflow !== ".github/workflows/release-npm.yml" || provenance?.ref !== "refs/heads/main" || provenance?.commit !== releaseTagCommit)
    problems.push("npm provenance does not match the canonical release workflow/tag commit");
  if (provenance?.statementType !== "https://in-toto.io/Statement/v1" || provenance?.predicateType !== "https://slsa.dev/provenance/v1") problems.push("npm provenance statement is not SLSA v1");
  if (!record?.attestationUrl || !record?.registrySignaturesValid) problems.push("npm attestation/signature evidence is incomplete");
  return problems;
}
