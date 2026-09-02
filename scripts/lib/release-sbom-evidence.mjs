import { readFileSync } from "node:fs";
import { join } from "node:path";

const identifierPattern = /^(?:npm|maven)-[a-z0-9-]+$/u;

function duplicates(values) {
  const seen = new Set();
  return [...new Set(values.filter(value => seen.size === seen.add(value).size))];
}

function normalizedSubjectPath(path) {
  return typeof path === "string" &&
    /^(?:(?:[.a-zA-Z0-9_-]+\/)?subjects\/)?(?:npm|maven)\/[^/]+(?:\/[^/]+)*$/u.test(path)
    ? path
    : undefined;
}

export function validateReleaseSbomPolicy(policy) {
  const problems = [];
  if (policy?.schemaVersion !== 3) problems.push(`Unsupported attestation policy schema ${policy?.schemaVersion}`);
  const trust = policy?.trust;
  if (!/^\d+$/u.test(trust?.repositoryId ?? "")) problems.push("attestation trust must declare an exact repository id");
  if (
    trust?.workflowIdentity !==
    `https://github.com/${policy?.repository}/.github/workflows/attest-public-release.yml@${trust?.workflowRef}`
  ) {
    problems.push("attestation trust must declare the canonical workflow identity");
  }
  if (trust?.workflowRef !== "refs/heads/main")
    problems.push("attestation trust must bind the canonical main workflow ref");
  if (trust?.workflowName !== "Attest public release SBOMs")
    problems.push("attestation trust must bind the canonical attester workflow name");
  if (trust?.oidcIssuer !== "https://token.actions.githubusercontent.com")
    problems.push("attestation trust must bind the GitHub Actions OIDC issuer");
  if (
    !Array.isArray(trust?.allowedTriggers) ||
    trust.allowedTriggers.length === 0 ||
    new Set(trust.allowedTriggers).size !== trust.allowedTriggers.length ||
    trust.allowedTriggers.some(trigger => !["workflow_dispatch", "workflow_run"].includes(trigger))
  ) {
    problems.push("attestation trust must declare unique supported workflow triggers");
  }
  if (!/^[0-9a-f]{40}$/u.test(trust?.minimumTrustedWorkflowCommit ?? ""))
    problems.push("attestation trust must declare an exact minimum trusted workflow commit");
  if (trust?.runnerEnvironment !== "github-hosted")
    problems.push("attestation trust must bind the GitHub-hosted runner environment");
  if (trust?.sourceRepositoryVisibility !== "public")
    problems.push("attestation trust must bind public repository visibility at signing");

  const npmPackages = policy?.npm?.packages ?? [];
  const mavenModules = policy?.maven?.modules ?? [];
  for (const duplicate of duplicates(npmPackages.map(entry => entry.name))) {
    problems.push(`npm package ${duplicate} is declared more than once`);
  }
  for (const duplicate of duplicates(npmPackages.map(entry => entry.directory))) {
    problems.push(`npm directory ${duplicate} is declared more than once`);
  }
  for (const duplicate of duplicates(mavenModules.map(entry => entry.name))) {
    problems.push(`Maven module ${duplicate} is declared more than once`);
  }

  const sbomIds = [...npmPackages, ...mavenModules].map(entry => entry.sbomId);
  for (const duplicate of duplicates(sbomIds)) problems.push(`SBOM id ${duplicate} is declared more than once`);
  for (const entry of [...npmPackages, ...mavenModules]) {
    if (!identifierPattern.test(entry.sbomId ?? "")) {
      problems.push(`${entry.name ?? "unnamed artifact"} must declare a filesystem-safe ecosystem SBOM id`);
    }
  }

  for (const entry of npmPackages) {
    if (!entry.name || !entry.directory) problems.push("every npm package must declare name and directory");
  }
  for (const module of mavenModules) {
    const artifacts = module.artifacts ?? [];
    if (artifacts.length === 0) problems.push(`Maven module ${module.name ?? "<missing>"} has no subjects`);
    const keys = artifacts.map(
      artifact => `${artifact.classifier ?? "<missing>"}.${artifact.extension ?? "<missing>"}`,
    );
    for (const duplicate of duplicates(keys)) {
      problems.push(`Maven module ${module.name} repeats artifact ${duplicate}`);
    }
  }

  if (policy?.npm?.expectedSubjectCount !== npmPackages.length) {
    problems.push("npm expectedSubjectCount must equal the number of per-package SBOM subjects");
  }
  const mavenCount = mavenModules.reduce((count, module) => count + (module.artifacts?.length ?? 0), 0);
  if (policy?.maven?.expectedSubjectCount !== mavenCount) {
    problems.push("Maven expectedSubjectCount must equal the declared module artifacts");
  }
  return problems;
}

function expectedCoordinates(policy, manifest) {
  const npmVersions = manifest.versions?.npm ?? {};
  const mavenVersion = manifest.versions?.maven?.version;
  return new Map([
    ...(policy.npm?.packages ?? []).map(entry => [
      entry.sbomId,
      {
        ecosystem: "npm",
        coordinate: `${entry.name}@${npmVersions[entry.name]}`,
        name: entry.name,
        subjectCount: 1,
        subjectFiles: [`${entry.name.replace(/^@/u, "").replace("/", "-")}-${npmVersions[entry.name]}.tgz`],
        version: npmVersions[entry.name],
      },
    ]),
    ...(policy.maven?.modules ?? []).map(entry => [
      entry.sbomId,
      {
        ecosystem: "maven",
        coordinate: `${policy.maven.group}:${entry.name}:${mavenVersion}`,
        group: policy.maven.group,
        name: entry.name,
        subjectCount: entry.artifacts?.length ?? 0,
        subjectFiles: (entry.artifacts ?? []).map(
          artifact => `${entry.name}-${mavenVersion}${artifact.classifier}.${artifact.extension}`,
        ),
        version: mavenVersion,
      },
    ]),
  ]);
}

export function validateReleaseSbomManifest(
  manifest,
  policy,
  { root, readText = path => readFileSync(path, "utf8") } = {},
) {
  const problems = [...validateReleaseSbomPolicy(policy)];
  if (manifest?.schemaVersion !== 2)
    problems.push(`release evidence schema must be 2, found ${manifest?.schemaVersion}`);
  const subjects = manifest?.subjects ?? [];
  const subjectByPath = new Map();
  for (const subject of subjects) {
    if (!normalizedSubjectPath(subject.path))
      problems.push(`invalid release subject path ${subject.path ?? "<missing>"}`);
    if (subjectByPath.has(subject.path)) problems.push(`release subject ${subject.path} is duplicated`);
    if (!/^[0-9a-f]{64}$/u.test(subject.sha256 ?? "")) {
      problems.push(`release subject ${subject.path ?? "<missing>"} has no valid SHA-256 digest`);
    }
    subjectByPath.set(subject.path, subject);
  }

  const expected = expectedCoordinates(policy, manifest);
  const mappings = manifest?.sboms ?? [];
  const mappedSubjects = new Map();
  const seenIds = new Set();
  const seenPaths = new Set();
  for (const mapping of mappings) {
    if (seenIds.has(mapping.id)) problems.push(`SBOM mapping ${mapping.id} is duplicated`);
    seenIds.add(mapping.id);
    if (seenPaths.has(mapping.path)) problems.push(`SBOM file ${mapping.path} is assigned to multiple subjects`);
    seenPaths.add(mapping.path);
    const classification = expected.get(mapping.id);
    if (!classification) {
      problems.push(`SBOM mapping ${mapping.id ?? "<missing>"} is not declared by policy`);
      continue;
    }
    if (mapping.ecosystem !== classification.ecosystem || mapping.coordinate !== classification.coordinate) {
      problems.push(`SBOM mapping ${mapping.id} does not identify ${classification.coordinate}`);
    }
    if (mapping.path !== `sbom/${mapping.id}.cdx.json`) {
      problems.push(`SBOM mapping ${mapping.id} must use sbom/${mapping.id}.cdx.json`);
    }
    if (mapping.checksums !== `mappings/${mapping.id}.sha256`) {
      problems.push(`SBOM mapping ${mapping.id} must use mappings/${mapping.id}.sha256`);
    }
    if (!Array.isArray(mapping.subjects) || mapping.subjects.length === 0) {
      problems.push(`SBOM mapping ${mapping.id} has no exact-byte subjects`);
      continue;
    }
    if (mapping.subjects.length !== classification.subjectCount) {
      problems.push(
        `SBOM mapping ${mapping.id} must own ${classification.subjectCount} subject(s), found ${mapping.subjects.length}`,
      );
    }
    if (classification.subjectFiles) {
      const actualFiles = mapping.subjects.map(path => path.split("/").at(-1)).sort();
      const expectedFiles = [...classification.subjectFiles].sort();
      if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
        problems.push(`SBOM mapping ${mapping.id} does not own exactly its declared artifact family`);
      }
    }
    for (const subjectPath of mapping.subjects) {
      const subject = subjectByPath.get(subjectPath);
      if (!subject) problems.push(`SBOM mapping ${mapping.id} references unknown subject ${subjectPath}`);
      else if (subject.ecosystem !== classification.ecosystem || subject.coordinate !== classification.coordinate) {
        problems.push(`SBOM mapping ${mapping.id} crosses artifact boundary at ${subjectPath}`);
      }
      const previous = mappedSubjects.get(subjectPath);
      if (previous)
        problems.push(`release subject ${subjectPath} is ambiguously mapped by ${previous} and ${mapping.id}`);
      mappedSubjects.set(subjectPath, mapping.id);
    }

    if (root) {
      try {
        const sbom = JSON.parse(readText(join(root, mapping.path)));
        if (
          sbom.bomFormat !== "CycloneDX" ||
          typeof sbom.specVersion !== "string" ||
          (sbom.components !== undefined && !Array.isArray(sbom.components)) ||
          !sbom.metadata?.component
        ) {
          problems.push(`${mapping.path} is not a subject-specific CycloneDX SBOM`);
        } else if (
          (classification.group && sbom.metadata.component.group !== classification.group) ||
          sbom.metadata.component.name !== classification.name ||
          sbom.metadata.component.version !== classification.version
        ) {
          problems.push(
            `${mapping.path} describes ${sbom.metadata.component.name}@${sbom.metadata.component.version}, not ${classification.coordinate}`,
          );
        }
        const expectedChecksums = mapping.subjects
          .map(path => `${subjectByPath.get(path)?.sha256 ?? "<missing>"}  ${path}`)
          .sort()
          .join("\n");
        const actualChecksums = readText(join(root, mapping.checksums)).trim().split(/\r?\n/u).sort().join("\n");
        if (actualChecksums !== expectedChecksums)
          problems.push(`${mapping.checksums} does not contain exactly its mapped subjects`);
      } catch (error) {
        problems.push(`could not validate files for ${mapping.id}: ${error instanceof Error ? error.message : error}`);
      }
    }
  }

  for (const id of expected.keys()) if (!seenIds.has(id)) problems.push(`policy SBOM ${id} has no evidence mapping`);
  for (const subject of subjects) {
    if (!mappedSubjects.has(subject.path)) problems.push(`release subject ${subject.path} has no SBOM mapping`);
  }
  return problems;
}

export function attestationMatrix(manifest) {
  return (manifest.sboms ?? []).map(mapping => ({
    id: mapping.id,
    sbom: `.public-release-evidence/${mapping.path}`,
    checksums: `.public-release-evidence/${mapping.checksums}`,
  }));
}
