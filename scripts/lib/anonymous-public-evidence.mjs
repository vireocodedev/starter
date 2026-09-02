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
