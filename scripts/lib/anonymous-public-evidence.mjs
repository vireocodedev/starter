export function validateAnonymousPublicEvidence({ manifest, release }) {
  const problems = [];
  const npm = manifest?.versions?.npm ?? {};
  for (const entry of release.npm)
    if (npm[entry.name] !== entry.version) problems.push(`npm evidence must contain ${entry.name}@${entry.version}`);
  if (
    manifest?.versions?.maven?.group !== release.maven.group ||
    manifest?.versions?.maven?.version !== release.maven.version
  )
    problems.push("Maven evidence must match the exact ecosystem coordinate");
  const npmSubjects = manifest?.subjects?.filter(subject => subject.ecosystem === "npm") ?? [];
  for (const entry of release.npm) {
    const subject = npmSubjects.find(candidate => candidate.name === entry.name && candidate.version === entry.version);
    if (!subject || !/^[0-9a-f]{64}$/u.test(subject.sha256 ?? ""))
      problems.push(`missing immutable npm subject digest for ${entry.name}`);
  }
  for (const module of release.maven.modules) {
    if (
      !(manifest?.subjects ?? []).some(
        subject => subject.coordinate === `${release.maven.group}:${module}:${release.maven.version}`,
      )
    )
      problems.push(`missing immutable Maven subject for ${module}`);
  }
  return problems;
}

export function validateExactNpmRecord({ record, expected, releaseTagCommit }) {
  const problems = [];
  if (record?.name !== expected.name || record?.version !== expected.version)
    problems.push("package identity/version mismatch");
  if (!/^sha512-/u.test(record?.integrity ?? "")) problems.push("registry integrity must be SHA-512");
  if (!/^[0-9a-f]{64}$/u.test(record?.sha256 ?? "")) problems.push("packed subject digest is invalid");
  if (record?.repository !== "https://github.com/vireocodedev/vireo")
    problems.push("package repository is not canonical");
  if (!record?.license || record.license !== "MIT" || record.licenseFile !== "LICENSE")
    problems.push("package license metadata/file mismatch");
  if (!record?.licenseContentVerified || !/^[0-9a-f]{64}$/u.test(record?.licenseSha256 ?? ""))
    problems.push("packed package MIT license content evidence is incomplete");
  if (!record?.inventorySafe || !record?.exportsSafe || !record?.binSafe)
    problems.push("package inventory or public targets are unsafe");
  const provenance = record?.provenance;
  if (
    provenance?.repository !== "vireocodedev/vireo" ||
    provenance?.workflow !== ".github/workflows/release-npm.yml" ||
    provenance?.ref !== "refs/heads/main" ||
    provenance?.commit !== releaseTagCommit
  )
    problems.push("npm provenance does not match the canonical release workflow/tag commit");
  if (
    provenance?.statementType !== "https://in-toto.io/Statement/v1" ||
    provenance?.predicateType !== "https://slsa.dev/provenance/v1"
  )
    problems.push("npm provenance statement is not SLSA v1");
  if (!record?.attestationUrl || !record?.registrySignaturesValid)
    problems.push("npm attestation/signature evidence is incomplete");
  return problems;
}

function sha512HexFromIntegrity(integrity) {
  const match = /^sha512-([A-Za-z0-9+/]+={0,2})$/u.exec(integrity ?? "");
  if (!match) throw new Error(`Invalid SHA-512 npm integrity ${JSON.stringify(integrity)}.`);
  const bytes = Buffer.from(match[1], "base64");
  if (bytes.length !== 64 || bytes.toString("base64") !== match[1]) {
    throw new Error(`Invalid SHA-512 npm integrity ${JSON.stringify(integrity)}.`);
  }
  return bytes.toString("hex");
}

function npmPurl({ name, version }) {
  const encodedName = name.startsWith("@") ? `%40${name.slice(1)}` : encodeURIComponent(name);
  return `pkg:npm/${encodedName}@${version}`;
}

function repositoryIdentity(value) {
  const match = /github\.com[/:]([^/]+\/[^/@]+)(?:\.git)?(?:@|$|\/)/u.exec(value ?? "");
  return match?.[1]?.replace(/\.git$/u, "") ?? null;
}

function materialCommit(material) {
  const digest = material?.digest ?? {};
  for (const key of ["gitCommit", "sha1", "sha256"]) {
    if (/^[a-f0-9]{40}$/u.test(digest[key] ?? "")) return digest[key];
  }
  return /@([a-f0-9]{40})(?:$|[?#])/u.exec(material?.uri ?? "")?.[1] ?? null;
}

function decodeDsseStatement(bundle, coordinate) {
  const payload = bundle?.dsseEnvelope?.payload;
  if (typeof payload !== "string") throw new Error(`${coordinate} attestation lacks a DSSE payload.`);
  try {
    return JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
  } catch (error) {
    throw new Error(`${coordinate} attestation has invalid DSSE JSON.`, { cause: error });
  }
}

/**
 * Validates one SLSA statement against the exact public package byte stream,
 * Vireo's canonical release workflow, and the peeled release tag.
 */
function statementProvenance({ statement, expected, integrity, releaseTagCommit, policy }) {
  const coordinate = `${expected?.name}@${expected?.version}`;
  const expectedPurl = npmPurl(expected);
  const expectedDigest = sha512HexFromIntegrity(integrity);
  const subject = statement.subject?.find(
    candidate => candidate?.name === expectedPurl && candidate?.digest?.sha512 === expectedDigest,
  );
  if (!subject) throw new Error(`${coordinate} provenance does not bind the exact npm SHA-512 subject.`);
  if (statement._type !== policy.statementType || statement.predicateType !== policy.predicateType) {
    throw new Error(`${coordinate} provenance is not an accepted SLSA v1 statement.`);
  }

  const workflow = statement.predicate?.buildDefinition?.externalParameters?.workflow;
  if (
    repositoryIdentity(workflow?.repository) !== policy.canonicalRepository ||
    workflow?.path !== policy.workflowPath ||
    workflow?.ref !== policy.workflowRef
  ) {
    throw new Error(`${coordinate} provenance does not name the canonical release workflow.`);
  }
  if (
    String(statement.predicate?.buildDefinition?.internalParameters?.github?.repository_id) !==
    String(policy.repositoryId)
  ) {
    throw new Error(`${coordinate} provenance has an unexpected GitHub repository id.`);
  }
  const materials = statement.predicate?.buildDefinition?.resolvedDependencies ?? statement.predicate?.materials ?? [];
  const material = materials.find(
    candidate =>
      repositoryIdentity(candidate?.uri) === policy.canonicalRepository &&
      materialCommit(candidate) === releaseTagCommit,
  );
  if (!material) throw new Error(`${coordinate} provenance does not bind the peeled create-vireo tag commit.`);

  return {
    repository: policy.canonicalRepository,
    workflow: policy.workflowPath,
    ref: policy.workflowRef,
    commit: releaseTagCommit,
    statementType: statement._type,
    predicateType: statement.predicateType,
    subject: { name: subject.name, sha512: subject.digest.sha512 },
  };
}

/**
 * Decodes provenance solely from the exact package/version entry npm has
 * already verified with `npm audit signatures --include-attestations`. The
 * registry attestation URL is discovery metadata, not an authority for the
 * SLSA identity claims.
 */
export function decodeExactNpmProvenance({ auditRecord, expected, integrity, releaseTagCommit, policy }) {
  const coordinate = `${expected?.name}@${expected?.version}`;
  if (!/^[a-f0-9]{40}$/u.test(releaseTagCommit ?? "")) {
    throw new Error(`${coordinate} requires a peeled 40-character release tag commit.`);
  }
  if (auditRecord?.name !== expected?.name || auditRecord?.version !== expected?.version) {
    throw new Error(`${coordinate} npm signature audit entry does not match the exact package/version.`);
  }
  const bundles = auditRecord?.attestationBundles;
  if (!Array.isArray(bundles) || bundles.length === 0) {
    throw new Error(`${coordinate} verified npm signature audit entry has no attestation bundles.`);
  }
  const failures = [];
  for (const entry of bundles) {
    try {
      return statementProvenance({
        statement: decodeDsseStatement(entry?.bundle, coordinate),
        expected,
        integrity,
        releaseTagCommit,
        policy,
      });
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }
  throw new Error(
    `${coordinate} verified npm audit bundles contain no exact canonical SLSA provenance: ${failures.join("; ")}`,
  );
}
