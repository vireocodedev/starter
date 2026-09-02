const historicalVireoReleaseWarning = Object.freeze({
  version: "0.8.1",
  reason: "GitHub Release immutability was enabled after this exact historical release.",
});

export function validateReleasePreflightIdentity({
  release,
  requestedReleaseId,
  requestedSourceCommit,
  verifierSourceCommit,
}) {
  const problems = [];
  if (requestedReleaseId && requestedReleaseId !== release.id)
    problems.push("requested release id does not match ecosystem current release");
  if (requestedSourceCommit && requestedSourceCommit !== verifierSourceCommit)
    problems.push("requested source commit does not match the verifier checkout");
  if (!/^npm-\d+\.\d+\.\d+_jvm-\d+\.\d+\.\d+$/u.test(release.id)) problems.push("release id is not exact");
  if (!/^[0-9a-f]{40}$/u.test(release.template.commit)) problems.push("Template commit is not immutable");
  return problems;
}

export function vireoReleaseImmutabilityFinding({ version, immutable }) {
  if (immutable) return null;
  if (version === historicalVireoReleaseWarning.version)
    return { category: "external-warning", owner: "provider", ...historicalVireoReleaseWarning };
  throw new Error(`Vireo GitHub Release ${version} must be immutable.`);
}

export async function peelGitHubTag({ repository, tag, fetchImpl = fetch }) {
  let response = await fetchImpl(`https://api.github.com/repos/${repository}/git/ref/tags/${encodeURIComponent(tag)}`);
  let value = await response.json();
  if (!response.ok) throw new Error(`Missing tag ${tag}.`);
  while (value.object?.type === "tag") {
    response = await fetchImpl(value.object.url);
    value = await response.json();
    if (!response.ok) throw new Error(`Could not peel annotated tag ${tag}.`);
  }
  if (value.object?.type !== "commit" || !/^[0-9a-f]{40}$/u.test(value.object.sha ?? ""))
    throw new Error(`Tag ${tag} does not resolve to a commit.`);
  return value.object.sha;
}

export async function verifyPublicReleasePreflight({ release, fetchImpl = fetch }) {
  const warnings = [];
  for (const entry of release.npm) {
    const response = await fetchImpl(`https://registry.npmjs.org/${encodeURIComponent(entry.name)}/${entry.version}`);
    const metadata = await response.json();
    if (
      !response.ok ||
      metadata.name !== entry.name ||
      metadata.version !== entry.version ||
      !metadata.dist?.integrity ||
      !metadata.dist?.attestations?.url
    )
      throw new Error(`npm preflight failed for ${entry.name}@${entry.version}.`);
  }
  for (const module of release.maven.modules) {
    const response = await fetchImpl(
      `https://repo.maven.apache.org/maven2/${release.maven.group.replaceAll(".", "/")}/${module}/${release.maven.version}/${module}-${release.maven.version}.pom`,
    );
    if (!response.ok) throw new Error(`Maven preflight failed for ${module}:${release.maven.version}.`);
  }
  const templateCommit = await peelGitHubTag({
    repository: "vireocodedev/vireo-template",
    tag: release.template.tag,
    fetchImpl,
  });
  if (templateCommit !== release.template.commit)
    throw new Error("Template tag does not resolve to declared immutable commit.");
  const templateRelease = await fetchImpl(
    `https://api.github.com/repos/vireocodedev/vireo-template/releases/tags/${encodeURIComponent(release.template.tag)}`,
  );
  const templatePayload = await templateRelease.json();
  if (!templateRelease.ok || templatePayload.tag_name !== release.template.tag || templatePayload.immutable !== true)
    throw new Error("Template release is not immutable.");
  const asset = templatePayload.assets?.find(candidate => /manifest.*\.json$/iu.test(candidate.name ?? ""));
  if (!asset?.browser_download_url) throw new Error("Template release has no immutable manifest asset.");
  const manifestResponse = await fetchImpl(asset.browser_download_url);
  const manifest = await manifestResponse.json();
  if (
    !manifestResponse.ok ||
    manifest.schemaVersion !== 1 ||
    manifest.version !== release.template.version ||
    manifest.tag !== release.template.tag ||
    manifest.createVireoVersion !== release.createVireoVersion ||
    manifest.ecosystemRelease !== release.id ||
    manifest.repository !== "vireocodedev/vireo-template" ||
    manifest.immutableReleasesRequired !== true ||
    manifest.commit !== release.template.commit
  )
    throw new Error("Template release manifest does not match the declared release coordinate.");
  const vireoRelease = await fetchImpl(
    `https://api.github.com/repos/vireocodedev/vireo/releases/tags/create-vireo%40${release.createVireoVersion}`,
  );
  const vireoPayload = await vireoRelease.json();
  if (!vireoRelease.ok || vireoPayload.tag_name !== `create-vireo@${release.createVireoVersion}`)
    throw new Error("Vireo npm release is missing its exact GitHub Release.");
  const warning = vireoReleaseImmutabilityFinding({
    version: release.createVireoVersion,
    immutable: vireoPayload.immutable === true,
  });
  if (warning) warnings.push(warning);
  const releaseTag = `create-vireo@${release.createVireoVersion}`;
  const releaseTagCommit = await peelGitHubTag({ repository: "vireocodedev/vireo", tag: releaseTag, fetchImpl });
  return { warnings, releaseTagCommit };
}
